import React, { useState } from 'react';

export const FeedbackWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [includeScreenshot, setIncludeScreenshot] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setIsOpen(false);
        setEmail('');
        setMessage('');
        setIncludeScreenshot(false);
      }, 2000);
    }, 1000);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 bg-primary text-white font-bold py-3 px-1 rounded-l-md shadow-lg z-50 hover:bg-primary/90 transition-colors writing-vertical-rl text-xs uppercase tracking-widest"
        style={{ writingMode: 'vertical-rl' }}
      >
        Feedback
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-off-white px-6 py-4 border-b border-border-hairline flex justify-between items-center">
              <h3 className="font-sans font-bold text-charcoal text-lg">Send Feedback</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-charcoal-muted hover:text-charcoal transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="size-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-2xl">check</span>
                  </div>
                  <h4 className="font-bold text-charcoal text-lg mb-2">Thank You!</h4>
                  <p className="text-charcoal-muted text-sm">Your feedback has been received.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-xs font-mono font-bold uppercase tracking-widest text-charcoal-muted mb-1">
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-border-hairline rounded-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm font-sans"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-xs font-mono font-bold uppercase tracking-widest text-charcoal-muted mb-1">
                      Message
                    </label>
                    <textarea
                      id="message"
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-border-hairline rounded-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm font-sans resize-none"
                      placeholder="Tell us what you think or report an issue..."
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="screenshot"
                      checked={includeScreenshot}
                      onChange={(e) => setIncludeScreenshot(e.target.checked)}
                      className="rounded border-border-hairline text-primary focus:ring-primary"
                    />
                    <label htmlFor="screenshot" className="text-sm text-charcoal cursor-pointer select-none">
                      Include screenshot of current view
                    </label>
                  </div>

                  <div className="pt-4 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-charcoal-muted hover:text-charcoal transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="size-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          Sending...
                        </>
                      ) : (
                        'Send Feedback'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
