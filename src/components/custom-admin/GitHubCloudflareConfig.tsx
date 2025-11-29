import { useState } from 'react';
import { Github, Cloud, CheckCircle, XCircle, RefreshCw, Settings } from 'lucide-react';

export default function GitHubCloudflareConfig() {
  const [githubToken, setGithubToken] = useState(() => localStorage.getItem('github_token') || '');
  const [cloudflareToken, setCloudflareToken] = useState(() => localStorage.getItem('cloudflare_token') || '');
  const [githubStatus, setGithubStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [cloudflareStatus, setCloudflareStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [showTokens, setShowTokens] = useState(false);
  const [cloudflareProjects, setCloudflareProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const testGitHubConnection = async () => {
    setGithubStatus('testing');
    try {
      // Test GitHub API connection
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (response.ok) {
        setGithubStatus('success');
        // Save token securely (in production, use environment variables)
        localStorage.setItem('github_token', githubToken);
        alert('GitHub connection successful!');
      } else {
        setGithubStatus('error');
        alert('GitHub connection failed. Check your token.');
      }
    } catch (_error) {
      setGithubStatus('error');
      alert('Error testing GitHub connection');
    }
  };

  const testCloudflareConnection = async () => {
    setCloudflareStatus('testing');
    try {
      // Test Cloudflare API connection
      const response = await fetch('https://api.cloudflare.com/client/v4/user/tokens/verify', {
        headers: {
          'Authorization': `Bearer ${cloudflareToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setCloudflareStatus('success');
        localStorage.setItem('cloudflare_token', cloudflareToken);
        await loadCloudflareProjects();
        alert('Cloudflare connection successful!');
      } else {
        setCloudflareStatus('error');
        alert('Cloudflare connection failed. Check your token.');
      }
    } catch (_error) {
      setCloudflareStatus('error');
      alert('Error testing Cloudflare connection');
    }
  };

  const loadCloudflareProjects = async () => {
    if (!cloudflareToken) return;
    
    setLoadingProjects(true);
    try {
      const ACCOUNT_ID = 'f1d6fdedf801e39f184a19ae201e8be1';
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects`,
        {
          headers: {
            'Authorization': `Bearer ${cloudflareToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCloudflareProjects(data.result || []);
        }
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoadingProjects(false);
    }
  };

  const triggerDeployment = async (projectName: string) => {
    if (!cloudflareToken) {
      alert('Please configure Cloudflare token first');
      return;
    }

    try {
      const ACCOUNT_ID = 'f1d6fdedf801e39f184a19ae201e8be1';
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${projectName}/deployments`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${cloudflareToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        await response.json();
        alert(`Deployment triggered for ${projectName}! Check Cloudflare dashboard for status.`);
      } else {
        const errorData = await response.json();
        alert(`Failed to trigger deployment: ${errorData.errors?.[0]?.message || 'Unknown error'}`);
      }
    } catch (_error) {
      alert('Error triggering deployment');
    }
  };

  const pushToGitHub = async () => {
    if (!githubToken) {
      alert('Please enter GitHub token first');
      return;
    }

    try {
      // This would trigger a server-side push
      // For now, show instructions
      alert('GitHub token configured! Use GitHub Desktop or command line to push:\n\ngit push origin main --force');
    } catch (_error) {
      alert('Error configuring GitHub push');
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Settings className="w-8 h-8 text-orange-500" />
            GitHub & Cloudflare API Configuration
          </h1>
          <p className="text-gray-400">
            Configure API tokens for automated GitHub pushes and Cloudflare deployments
          </p>
        </div>

        {/* GitHub Configuration */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Github className="w-6 h-6" />
              GitHub API Token
            </h2>
            <button
              onClick={() => setShowTokens(!showTokens)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
            >
              {showTokens ? 'Hide' : 'Show'} Token
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">GitHub Personal Access Token</label>
              <input
                type={showTokens ? "text" : "password"}
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-orange-500 focus:outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                Get from: GitHub → Settings → Developer settings → Personal access tokens
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={testGitHubConnection}
                disabled={!githubToken || githubStatus === 'testing'}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                {githubStatus === 'testing' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Test Connection
                  </>
                )}
              </button>

              <button
                onClick={pushToGitHub}
                disabled={!githubToken || githubStatus !== 'success'}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <Github className="w-4 h-4" />
                Push to GitHub
              </button>
            </div>

            {githubStatus === 'success' && (
              <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-sm">GitHub connection successful!</span>
              </div>
            )}

            {githubStatus === 'error' && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-400" />
                <span className="text-sm">GitHub connection failed. Check your token.</span>
              </div>
            )}
          </div>
        </div>

        {/* Cloudflare Configuration */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Cloud className="w-6 h-6" />
            Cloudflare API Token
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Cloudflare API Token</label>
              <input
                type={showTokens ? "text" : "password"}
                value={cloudflareToken}
                onChange={(e) => setCloudflareToken(e.target.value)}
                placeholder="Enter Cloudflare API token"
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-orange-500 focus:outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                Get from: Cloudflare Dashboard → My Profile → API Tokens
              </p>
            </div>

            <button
              onClick={testCloudflareConnection}
              disabled={!cloudflareToken || cloudflareStatus === 'testing'}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              {cloudflareStatus === 'testing' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Test Connection
                </>
              )}
            </button>

            {cloudflareStatus === 'success' && (
              <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-sm">Cloudflare connection successful!</span>
              </div>
            )}

            {cloudflareStatus === 'error' && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-400" />
                <span className="text-sm">Cloudflare connection failed. Check your token.</span>
              </div>
            )}

            {cloudflareStatus === 'success' && (
              <div className="mt-4">
                <button
                  onClick={loadCloudflareProjects}
                  disabled={loadingProjects}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg text-sm font-semibold flex items-center gap-2"
                >
                  {loadingProjects ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Cloud className="w-4 h-4" />
                      Load Projects
                    </>
                  )}
                </button>

                {cloudflareProjects.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h3 className="font-semibold text-sm">Cloudflare Pages Projects:</h3>
                    {cloudflareProjects.map((project) => (
                      <div key={project.id} className="bg-gray-700 rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{project.name}</p>
                          <p className="text-xs text-gray-400">
                            {project.subdomain ? `https://${project.subdomain}.pages.dev` : 'No subdomain'}
                          </p>
                        </div>
                        <button
                          onClick={() => triggerDeployment(project.name)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-xs font-semibold"
                        >
                          Deploy
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-500/20 border border-blue-500/50 rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4">How to Use</h3>
          <ol className="space-y-2 text-sm list-decimal list-inside">
            <li>Enter your GitHub token and click "Test Connection"</li>
            <li>Enter your Cloudflare token and click "Test Connection"</li>
            <li>Once both are connected, you can push to GitHub automatically</li>
            <li>Cloudflare will auto-deploy when you push</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

