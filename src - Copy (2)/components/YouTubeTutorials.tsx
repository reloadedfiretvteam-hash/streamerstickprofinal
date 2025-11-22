import { Play, ExternalLink } from 'lucide-react';

export default function YouTubeTutorials() {
  const tutorials = [
    {
      title: 'How to Set Up IPTV on Fire Stick',
      thumbnail: '/OIP (11) websit pic.jpg',
      duration: '5:30',
      views: '125K',
      url: 'https://youtu.be/sO2Id0bXHIY?si=1FBAbzYvUViIpepS',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 to-slate-800 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Step-by-Step Video Tutorials
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Watch our easy-to-follow guides and get started in minutes
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {tutorials.map((tutorial, index) => (
            <a
              key={index}
              href={tutorial.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative bg-gray-800 rounded-xl overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2"
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={tutorial.thumbnail}
                  alt={tutorial.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                    <Play className="w-8 h-8 text-white fill-current ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs font-semibold">
                  {tutorial.duration}
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                  {tutorial.title}
                </h3>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>{tutorial.views} views</span>
                  <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="https://youtu.be/sO2Id0bXHIY?si=1FBAbzYvUViIpepS"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-700 rounded-xl font-semibold transition-all transform hover:scale-105"
          >
            <Play className="w-5 h-5" />
            Watch Full Tutorial on YouTube
          </a>
        </div>
      </div>
    </section>
  );
}
