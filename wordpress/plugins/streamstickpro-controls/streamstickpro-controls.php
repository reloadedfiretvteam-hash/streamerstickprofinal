<?php
/**
 * Plugin Name: StreamStickPro Controls
 * Description: Friendly WordPress admin controls for StreamStickPro headless homepage and pricing JSON, plus REST diagnostics.
 * Version: 0.2.0
 * Author: StreamStickPro
 */

if (!defined('ABSPATH')) {
    exit;
}

final class StreamStickPro_Controls {
    private const HOME_SLUG = 'streamstick-home-v1';
    private const PRICING_SLUG = 'streamstick-pricing-v1';
    private const NONCE_ACTION = 'ssp_controls_save';

    public static function boot(): void {
        add_action('admin_menu', [__CLASS__, 'register_menu']);
        add_action('rest_api_init', [__CLASS__, 'register_rest_routes']);
    }

    public static function register_rest_routes(): void {
        register_rest_route('streamstickpro/v1', '/health', [
            'methods'             => 'GET',
            'permission_callback' => '__return_true',
            'callback'            => [__CLASS__, 'rest_health'],
        ]);

        register_rest_route('streamstickpro/v1', '/ensure-pages', [
            'methods'             => 'POST',
            'permission_callback' => function () { return current_user_can('edit_pages'); },
            'callback'            => [__CLASS__, 'rest_ensure_pages'],
        ]);
    }

    public static function rest_health(): array {
        $home = self::get_page_by_slug(self::HOME_SLUG);
        $pricing = self::get_page_by_slug(self::PRICING_SLUG);

        return [
            'plugin'      => 'streamstickpro-controls',
            'version'     => '0.2.0',
            'wp_version'  => get_bloginfo('version'),
            'site_url'    => home_url(),
            'pages'       => [
                'home'    => $home    ? ['id' => $home->ID,    'status' => $home->post_status,    'slug' => self::HOME_SLUG]    : null,
                'pricing' => $pricing ? ['id' => $pricing->ID, 'status' => $pricing->post_status, 'slug' => self::PRICING_SLUG] : null,
            ],
            'ok'          => $home !== null && $pricing !== null,
        ];
    }

    public static function rest_ensure_pages(): array {
        $created = [];
        foreach ([self::HOME_SLUG => 'StreamStickPro Home', self::PRICING_SLUG => 'StreamStickPro Pricing'] as $slug => $title) {
            $existing = self::get_page_by_slug($slug);
            if ($existing) {
                $created[$slug] = ['id' => $existing->ID, 'status' => $existing->post_status, 'created' => false];
                continue;
            }
            $page_id = wp_insert_post([
                'post_type'    => 'page',
                'post_title'   => $title,
                'post_name'    => $slug,
                'post_status'  => 'publish',
                'post_content' => '<pre><code>{}</code></pre>',
            ], true);
            if (is_wp_error($page_id)) {
                $created[$slug] = ['error' => $page_id->get_error_message(), 'created' => false];
            } else {
                $created[$slug] = ['id' => $page_id, 'status' => 'publish', 'created' => true];
            }
        }
        return ['ok' => true, 'pages' => $created];
    }

    public static function register_menu(): void {
        add_menu_page(
            'StreamStickPro Controls',
            'StreamStickPro Controls',
            'edit_pages',
            'streamstickpro-controls',
            [__CLASS__, 'render_page'],
            'dashicons-welcome-widgets-menus',
            3
        );
    }

    private static function get_page_by_slug(string $slug): ?WP_Post {
        $pages = get_posts([
            'name' => $slug,
            'post_type' => 'page',
            'post_status' => ['publish', 'draft', 'pending', 'private', 'future'],
            'numberposts' => 1,
        ]);

        return $pages[0] ?? null;
    }

    private static function decode_entities(string $value): string {
        return html_entity_decode(wp_strip_all_tags($value), ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }

    private static function extract_json(string $content): array {
        $candidates = [];

        if (preg_match_all('/<script[^>]*type=["\']application\/json["\'][^>]*>([\s\S]*?)<\/script>/i', $content, $matches)) {
            $candidates = array_merge($candidates, $matches[1]);
        }
        if (preg_match_all('/<pre[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/i', $content, $matches)) {
            $candidates = array_merge($candidates, $matches[1]);
        }

        $candidates[] = $content;
        $candidates[] = self::decode_entities($content);

        foreach ($candidates as $candidate) {
            $decoded = html_entity_decode(trim((string) $candidate), ENT_QUOTES | ENT_HTML5, 'UTF-8');
            $data = json_decode($decoded, true);
            if (is_array($data)) {
                return $data;
            }
        }

        return [];
    }

    private static function load_data(string $slug): array {
        $page = self::get_page_by_slug($slug);
        if (!$page) {
            return [];
        }

        return self::extract_json($page->post_content);
    }

    private static function save_data(string $slug, array $data): ?string {
        $page = self::get_page_by_slug($slug);
        if (!$page) {
            return 'Could not find page: ' . $slug;
        }

        $json = wp_json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        if (!$json) {
            return 'Could not encode JSON for ' . $slug;
        }

        $result = wp_update_post([
            'ID' => $page->ID,
            'post_content' => '<pre><code>' . esc_html($json) . '</code></pre>',
        ], true);

        if (is_wp_error($result)) {
            return $result->get_error_message();
        }

        return null;
    }

    private static function text_field(array $data, array $path, string $fallback = ''): string {
        $value = $data;
        foreach ($path as $key) {
            if (!is_array($value) || !array_key_exists($key, $value)) {
                return $fallback;
            }
            $value = $value[$key];
        }

        return is_scalar($value) ? (string) $value : $fallback;
    }

    private static function set_path(array &$data, array $path, string $value): void {
        $cursor = &$data;
        foreach ($path as $index => $key) {
            if ($index === count($path) - 1) {
                $cursor[$key] = sanitize_textarea_field($value);
                return;
            }
            if (!isset($cursor[$key]) || !is_array($cursor[$key])) {
                $cursor[$key] = [];
            }
            $cursor = &$cursor[$key];
        }
    }

    private static function apply_request(array $data, string $prefix): array {
        $fields = [
            'meta_title' => ['meta', 'title'],
            'meta_description' => ['meta', 'description'],
            'hero_title' => ['hero', 'title'],
            'hero_description' => ['hero', 'description'],
            'hero_subtitle' => ['hero', 'subtitle'],
            'hero_proofline' => ['hero', 'proofline'],
            'support_email' => ['support', 'email'],
            'support_whatsapp_url' => ['support', 'whatsappUrl'],
        ];

        foreach ($fields as $request_key => $path) {
            $full_key = $prefix . '_' . $request_key;
            if (isset($_POST[$full_key])) {
                self::set_path($data, $path, wp_unslash($_POST[$full_key]));
            }
        }

        if (isset($_POST[$prefix . '_plans']) && is_array($_POST[$prefix . '_plans'])) {
            $plans = [];
            foreach (wp_unslash($_POST[$prefix . '_plans']) as $plan) {
                if (!is_array($plan)) {
                    continue;
                }
                $plans[] = [
                    'title' => sanitize_text_field($plan['title'] ?? ''),
                    'badge' => sanitize_text_field($plan['badge'] ?? ''),
                    'priceText' => sanitize_text_field($plan['priceText'] ?? ''),
                    'periodText' => sanitize_text_field($plan['periodText'] ?? ''),
                    'highlighted' => !empty($plan['highlighted']),
                    'features' => array_values(array_filter(array_map('sanitize_text_field', preg_split('/\r\n|\r|\n/', (string) ($plan['features'] ?? ''))))),
                    'ctaLabel' => sanitize_text_field($plan['ctaLabel'] ?? ''),
                    'ctaHref' => sanitize_text_field($plan['ctaHref'] ?? ''),
                ];
            }
            $data['plans'] = $plans;
        }

        if ($prefix === 'pricing') {
            foreach (['shadow', 'live'] as $mode) {
                $key = 'pricing_prices_' . $mode;
                if (isset($_POST[$key])) {
                    $decoded = json_decode(wp_unslash($_POST[$key]), true);
                    if (is_array($decoded)) {
                        $data['prices'][$mode] = $decoded;
                    }
                }
            }
        }

        return $data;
    }

    public static function render_page(): void {
        if (!current_user_can('edit_pages')) {
            wp_die(esc_html__('You do not have permission to access this page.', 'streamstickpro-controls'));
        }

        $notice = null;
        $error = null;

        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['ssp_controls_nonce'])) {
            check_admin_referer(self::NONCE_ACTION, 'ssp_controls_nonce');

            $target = sanitize_key($_POST['ssp_target'] ?? '');
            if ($target === 'home') {
                $data = self::apply_request(self::load_data(self::HOME_SLUG), 'home');
                $error = self::save_data(self::HOME_SLUG, $data);
                $notice = $error ? null : 'Homepage controls saved.';
            } elseif ($target === 'pricing') {
                $data = self::apply_request(self::load_data(self::PRICING_SLUG), 'pricing');
                $error = self::save_data(self::PRICING_SLUG, $data);
                $notice = $error ? null : 'Pricing controls saved.';
            }
        }

        $home = self::load_data(self::HOME_SLUG);
        $pricing = self::load_data(self::PRICING_SLUG);
        ?>
        <div class="wrap ssp-controls">
            <h1>StreamStickPro Controls</h1>
            <p>Use these fields to control the live React storefront through WordPress. Stripe checkout remains separate until you intentionally map verified <code>price_...</code> IDs.</p>

            <?php if ($notice): ?>
                <div class="notice notice-success is-dismissible"><p><?php echo esc_html($notice); ?></p></div>
            <?php endif; ?>
            <?php if ($error): ?>
                <div class="notice notice-error is-dismissible"><p><?php echo esc_html($error); ?></p></div>
            <?php endif; ?>

            <?php self::render_home_form($home); ?>
            <?php self::render_pricing_form($pricing); ?>
        </div>
        <style>
            .ssp-controls .ssp-card { background:#fff; border:1px solid #ccd0d4; margin:20px 0; padding:20px; max-width:1100px; }
            .ssp-controls .ssp-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px; }
            .ssp-controls label { display:block; font-weight:600; margin-bottom:6px; }
            .ssp-controls input[type="text"], .ssp-controls textarea { width:100%; }
            .ssp-controls textarea { min-height:90px; }
            .ssp-controls .ssp-plan { border:1px solid #dcdcde; padding:14px; margin:12px 0; background:#f6f7f7; }
            @media (max-width: 900px) { .ssp-controls .ssp-grid { grid-template-columns:1fr; } }
        </style>
        <?php
    }

    private static function render_home_form(array $home): void {
        ?>
        <form method="post" class="ssp-card">
            <?php wp_nonce_field(self::NONCE_ACTION, 'ssp_controls_nonce'); ?>
            <input type="hidden" name="ssp_target" value="home">
            <h2>Homepage</h2>
            <div class="ssp-grid">
                <?php self::render_input('home_meta_title', 'SEO Title', self::text_field($home, ['meta', 'title'])); ?>
                <?php self::render_input('home_hero_title', 'Hero Title', self::text_field($home, ['hero', 'title'])); ?>
                <?php self::render_textarea('home_meta_description', 'SEO Description', self::text_field($home, ['meta', 'description'])); ?>
                <?php self::render_textarea('home_hero_subtitle', 'Hero Subtitle', self::text_field($home, ['hero', 'subtitle'])); ?>
                <?php self::render_input('home_hero_proofline', 'Proof Line', self::text_field($home, ['hero', 'proofline'])); ?>
                <?php self::render_input('home_support_email', 'Support Email', self::text_field($home, ['support', 'email'])); ?>
                <?php self::render_input('home_support_whatsapp_url', 'WhatsApp URL', self::text_field($home, ['support', 'whatsappUrl'])); ?>
            </div>
            <?php submit_button('Save Homepage Controls'); ?>
        </form>
        <?php
    }

    private static function render_pricing_form(array $pricing): void {
        $plans = is_array($pricing['plans'] ?? null) ? $pricing['plans'] : [];
        ?>
        <form method="post" class="ssp-card">
            <?php wp_nonce_field(self::NONCE_ACTION, 'ssp_controls_nonce'); ?>
            <input type="hidden" name="ssp_target" value="pricing">
            <h2>Pricing Page</h2>
            <div class="ssp-grid">
                <?php self::render_input('pricing_meta_title', 'SEO Title', self::text_field($pricing, ['meta', 'title'])); ?>
                <?php self::render_input('pricing_hero_title', 'Hero Title', self::text_field($pricing, ['hero', 'title'])); ?>
                <?php self::render_textarea('pricing_meta_description', 'SEO Description', self::text_field($pricing, ['meta', 'description'])); ?>
                <?php self::render_textarea('pricing_hero_description', 'Hero Description', self::text_field($pricing, ['hero', 'description'])); ?>
            </div>

            <h3>Visible Plans</h3>
            <?php foreach ($plans as $index => $plan): ?>
                <div class="ssp-plan">
                    <div class="ssp-grid">
                        <?php self::render_input("pricing_plans[$index][title]", 'Plan Title', (string) ($plan['title'] ?? '')); ?>
                        <?php self::render_input("pricing_plans[$index][badge]", 'Badge', (string) ($plan['badge'] ?? '')); ?>
                        <?php self::render_input("pricing_plans[$index][priceText]", 'Display Price', (string) ($plan['priceText'] ?? '')); ?>
                        <?php self::render_input("pricing_plans[$index][periodText]", 'Period', (string) ($plan['periodText'] ?? '')); ?>
                        <?php self::render_input("pricing_plans[$index][ctaLabel]", 'Button Text', (string) ($plan['ctaLabel'] ?? '')); ?>
                        <?php self::render_input("pricing_plans[$index][ctaHref]", 'Button Link', (string) ($plan['ctaHref'] ?? '')); ?>
                    </div>
                    <?php self::render_textarea("pricing_plans[$index][features]", 'Features, one per line', implode("\n", is_array($plan['features'] ?? null) ? $plan['features'] : [])); ?>
                    <label><input type="checkbox" name="<?php echo esc_attr("pricing_plans[$index][highlighted]"); ?>" value="1" <?php checked(!empty($plan['highlighted'])); ?>> Highlight this plan</label>
                </div>
            <?php endforeach; ?>

            <h3>Stripe Price ID Overrides</h3>
            <p>Only add verified Stripe Price IDs. Empty maps keep the current checkout fallback.</p>
            <div class="ssp-grid">
                <?php self::render_textarea('pricing_prices_shadow', 'Shadow price map JSON', wp_json_encode($pricing['prices']['shadow'] ?? [], JSON_PRETTY_PRINT)); ?>
                <?php self::render_textarea('pricing_prices_live', 'Live price map JSON', wp_json_encode($pricing['prices']['live'] ?? [], JSON_PRETTY_PRINT)); ?>
            </div>
            <?php submit_button('Save Pricing Controls'); ?>
        </form>
        <?php
    }

    private static function render_input(string $name, string $label, string $value): void {
        ?>
        <p>
            <label for="<?php echo esc_attr($name); ?>"><?php echo esc_html($label); ?></label>
            <input type="text" id="<?php echo esc_attr($name); ?>" name="<?php echo esc_attr($name); ?>" value="<?php echo esc_attr($value); ?>">
        </p>
        <?php
    }

    private static function render_textarea(string $name, string $label, string $value): void {
        ?>
        <p>
            <label for="<?php echo esc_attr($name); ?>"><?php echo esc_html($label); ?></label>
            <textarea id="<?php echo esc_attr($name); ?>" name="<?php echo esc_attr($name); ?>"><?php echo esc_textarea($value); ?></textarea>
        </p>
        <?php
    }
}

StreamStickPro_Controls::boot();
