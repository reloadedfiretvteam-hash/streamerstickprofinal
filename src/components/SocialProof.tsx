import { ShoppingBag, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Notification {
  id: number;
  name: string;
  location: string;
  product: string;
  timeAgo: string;
}

export default function SocialProof() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);

  const sampleNotifications: Notification[] = [
    { id: 1, name: 'Michael R.', location: 'New York, NY', product: '12-Month Premium IPTV Subscription', timeAgo: '2 minutes ago' },
    { id: 2, name: 'Sarah J.', location: 'Los Angeles, CA', product: 'Fire Stick 4K with Alexa Voice Remote', timeAgo: '5 minutes ago' },
    { id: 3, name: 'David C.', location: 'Chicago, IL', product: '6-Month IPTV + Sports Package', timeAgo: '8 minutes ago' },
    { id: 4, name: 'Jennifer M.', location: 'Houston, TX', product: 'Fire Stick 4K Max + 1 Year IPTV Bundle', timeAgo: '12 minutes ago' },
    { id: 5, name: 'Robert T.', location: 'Phoenix, AZ', product: '3-Month IPTV with PPV Access', timeAgo: '15 minutes ago' },
    { id: 6, name: 'Amanda W.', location: 'Philadelphia, PA', product: 'Fire Stick 4K Max Fully Loaded', timeAgo: '18 minutes ago' },
    { id: 7, name: 'Carlos G.', location: 'San Antonio, TX', product: '12-Month IPTV + International Channels', timeAgo: '22 minutes ago' },
    { id: 8, name: 'Lisa A.', location: 'San Diego, CA', product: 'Fire Stick Premium Bundle with IPTV', timeAgo: '25 minutes ago' },
    { id: 9, name: 'James P.', location: 'Dallas, TX', product: '6-Month IPTV Family Package', timeAgo: '28 minutes ago' },
    { id: 10, name: 'Emily S.', location: 'Seattle, WA', product: 'Fire Stick 4K with 3-Month IPTV Trial', timeAgo: '31 minutes ago' },
    { id: 11, name: 'Marcus B.', location: 'Atlanta, GA', product: '12-Month Premium IPTV + VOD Library', timeAgo: '35 minutes ago' },
    { id: 12, name: 'Nicole T.', location: 'Miami, FL', product: 'Fire Stick Ultimate Bundle + Accessories', timeAgo: '38 minutes ago' },
    { id: 13, name: 'Kevin L.', location: 'Boston, MA', product: '12-Month IPTV with Sports & Movies', timeAgo: '42 minutes ago' },
    { id: 14, name: 'Rachel H.', location: 'Denver, CO', product: 'Fire Stick 4K + 6-Month IPTV Package', timeAgo: '45 minutes ago' },
    { id: 15, name: 'Brandon K.', location: 'Portland, OR', product: '3-Month IPTV + Premium Channels', timeAgo: '48 minutes ago' },
    { id: 16, name: 'Stephanie M.', location: 'Austin, TX', product: 'Fire Stick 4K Max with Remote & IPTV', timeAgo: '52 minutes ago' },
    { id: 17, name: 'Derek W.', location: 'Charlotte, NC', product: '12-Month IPTV All-Access Pass', timeAgo: '55 minutes ago' },
    { id: 18, name: 'Timothy H.', location: 'Las Vegas, NV', product: 'Fire Stick 4K + 12-Month IPTV Premium', timeAgo: '58 minutes ago' },
    { id: 19, name: 'Monica S.', location: 'Nashville, TN', product: '6-Month IPTV + Live Sports Channels', timeAgo: '1 hour ago' },
    { id: 20, name: 'Andrew M.', location: 'Minneapolis, MN', product: 'Fire Stick Ultimate + Lifetime Support', timeAgo: '1 hour ago' },
    { id: 21, name: 'Diana K.', location: 'San Francisco, CA', product: '12-Month Premium IPTV + Movie Library', timeAgo: '1 hour ago' },
    { id: 22, name: 'Christopher L.', location: 'Orlando, FL', product: 'Fire Stick 4K Max Bundle + 3-Month IPTV', timeAgo: '1 hour ago' }
  ];

  const shuffleArray = (array: number[]): number[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  useEffect(() => {
    setNotifications(sampleNotifications);
    const indices = shuffleArray(sampleNotifications.map((_, i) => i));
    setShuffledIndices(indices);

    let shufflePosition = 0;

    const showTimer = setInterval(() => {
      setIsVisible(true);
    }, 120000);

    const hideTimer = setInterval(() => {
      setIsVisible(false);
    }, 140000);

    const cycleTimer = setInterval(() => {
      shufflePosition = (shufflePosition + 1) % indices.length;

      if (shufflePosition === 0) {
        const newIndices = shuffleArray(sampleNotifications.map((_, i) => i));
        setShuffledIndices(newIndices);
      }

      setCurrentIndex(shufflePosition);
    }, 120000);

    return () => {
      clearInterval(showTimer);
      clearInterval(hideTimer);
      clearInterval(cycleTimer);
    };
  }, []);

  if (notifications.length === 0 || shuffledIndices.length === 0) return null;

  const currentNotification = notifications[shuffledIndices[currentIndex]];

  return (
    <div
      className={`fixed bottom-24 left-6 z-30 transition-all duration-500 transform ${
        isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
      }`}
    >
      <div className="bg-white rounded-xl shadow-2xl p-4 max-w-sm border-l-4 border-green-500">
        <div className="flex items-start gap-3">
          <div className="bg-green-100 rounded-full p-2">
            <ShoppingBag className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-gray-900">{currentNotification.name}</span>
              <span className="text-xs text-gray-500">just purchased</span>
            </div>
            <div className="text-sm text-gray-700 font-medium mb-2">
              {currentNotification.product}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <MapPin className="w-3 h-3" />
              <span>{currentNotification.location}</span>
              <span>•</span>
              <span>{currentNotification.timeAgo}</span>
            </div>
          </div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
