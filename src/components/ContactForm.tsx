import { useState } from 'react';
import { Mail, Send, Loader2 } from 'lucide-react';

interface ContactFormProps {
  defaultEmail?: string;
  defaultSubject?: string;
}

export default function ContactForm({ defaultEmail = 'reloadedfiretvteam@gmail.com', defaultSubject = '' }: ContactFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Create mailto link with form data
      const mailtoBody = `Name: ${encodeURIComponent(name)}\nEmail: ${encodeURIComponent(email)}\n\nMessage:\n${encodeURIComponent(message)}`;
      const mailtoLink = `mailto:${defaultEmail}?subject=${encodeURIComponent(subject || 'Customer Support Request')}&body=${mailtoBody}`;
      
      // Open default email client
      window.location.href = mailtoLink;
      
      // Show success message after a brief delay
      setTimeout(() => {
        setSubmitStatus('success');
        setIsSubmitting(false);
        // Reset form after 3 seconds
        setTimeout(() => {
          setName('');
          setEmail('');
          setSubject(defaultSubject);
          setMessage('');
          setSubmitStatus('idle');
        }, 3000);
      }, 500);
    } catch (error) {
      setSubmitStatus('error');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/20 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
          <Mail className="w-6 h-6 text-orange-400" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">Contact Support</h3>
          <p className="text-gray-300 text-sm">Send us a message and we'll get back to you</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Your Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Your Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="your.email@example.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
            Subject <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="How can we help you?"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
            Message <span className="text-red-400">*</span>
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={6}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            placeholder="Please describe your question or issue in detail..."
          />
        </div>

        {submitStatus === 'success' && (
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-green-300">
            ✓ Your email client should open. If it doesn't, please email us directly at {defaultEmail}
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-300">
            There was an error. Please email us directly at {defaultEmail}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 shadow-lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Opening Email Client...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send Message
            </>
          )}
        </button>

        <p className="text-center text-gray-400 text-sm">
          Clicking "Send Message" will open your default email client with your message pre-filled.
        </p>
      </form>
    </div>
  );
}

