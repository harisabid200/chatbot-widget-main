/**
 * AI Chat Widget
 * A modern, embeddable chat widget with domain validation
 * Version: 1.0.0
 */

(function() {
  'use strict';

  const AIChatWidget = {
    config: null,
    isOpen: false,
    messages: [],
    isLoading: false,

    /**
     * Initialize the widget
     * @param {Object} options - Configuration options
     * @param {string} options.configUrl - URL to the configuration JSON file
     */
    init: async function(options) {
      if (!options.configUrl) {
        console.error('AIChatWidget: configUrl is required');
        return;
      }

      try {
        // Load configuration
        const response = await fetch(options.configUrl);
        this.config = await response.json();

        // Inject styles
        this.injectStyles();

        // Create widget HTML
        this.createWidget();

        // Add welcome message
        this.addMessage({
          text: this.config.welcomeMessage,
          sender: 'bot',
          timestamp: new Date()
        });

        console.log('AIChatWidget: Initialized successfully');
      } catch (error) {
        console.error('AIChatWidget: Failed to initialize', error);
      }
    },

    /**
     * Inject CSS styles
     */
    injectStyles: function() {
      const styles = `
        @keyframes slideInFromBottom {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        #ai-chat-widget {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          z-index: 999999;
        }

        #ai-chat-widget * {
          box-sizing: border-box;
        }

        .chat-bubble {
          position: relative;
          cursor: pointer;
          border: none;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .chat-bubble:hover {
          transform: scale(1.1);
        }

        .chat-bubble::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          opacity: 0.2;
        }

        .chat-bubble-icon {
          position: relative;
          z-index: 1;
        }

        .chat-notification {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 16px;
          height: 16px;
          background-color: #ef4444;
          border-radius: 50%;
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .chat-window {
          animation: slideInFromBottom 0.3s ease-out;
        }

        .chat-messages {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
        }

        .chat-messages::-webkit-scrollbar {
          width: 6px;
        }

        .chat-messages::-webkit-scrollbar-track {
          background: #f1f5f9;
        }

        .chat-messages::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        .chat-messages::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        .chat-input textarea {
          scrollbar-width: thin;
        }

        .chat-input textarea::-webkit-scrollbar {
          width: 4px;
        }

        .chat-input textarea::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 2px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading-spinner {
          animation: spin 1s linear infinite;
        }

        @media (max-width: 640px) {
          .chat-window {
            width: 100vw !important;
            height: 100vh !important;
            border-radius: 0 !important;
          }
        }
      `;

      const styleSheet = document.createElement('style');
      styleSheet.textContent = styles;
      document.head.appendChild(styleSheet);
    },

    /**
     * Create widget HTML structure
     */
    createWidget: function() {
      const position = this.config.position === 'bottom-left' ? 'left: 24px;' : 'right: 24px;';
      
      const widgetHTML = `
        <div id="ai-chat-widget" style="position: fixed; ${position} bottom: 24px; z-index: 999999;">
          <!-- Chat Bubble -->
          <button id="chat-bubble-btn" class="chat-bubble" style="
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background-color: ${this.config.primaryColor};
            color: white;
            border: none;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
          ">
            <svg class="chat-bubble-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span class="chat-notification"></span>
          </button>

          <!-- Chat Window -->
          <div id="chat-window" class="chat-window" style="
            display: none;
            width: 384px;
            height: 600px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
            flex-direction: column;
          ">
            <!-- Header -->
            <div class="chat-header" style="
              background-color: ${this.config.primaryColor};
              color: white;
              padding: 16px 24px;
              display: flex;
              align-items: center;
              justify-content: space-between;
            ">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="
                  width: 40px;
                  height: 40px;
                  background: rgba(255,255,255,0.3);
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                ">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <div>
                  <h3 style="margin: 0; font-size: 18px; font-weight: 600;">${this.config.botName}</h3>
                  <p style="margin: 0; font-size: 12px; opacity: 0.9;">Online</p>
                </div>
              </div>
              <button id="close-chat-btn" style="
                background: rgba(255,255,255,0.2);
                border: none;
                border-radius: 50%;
                width: 36px;
                height: 36px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.2s;
              ">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <!-- Messages -->
            <div id="chat-messages" class="chat-messages" style="
              flex: 1;
              overflow-y: auto;
              padding: 16px 24px;
              background: #f9fafb;
              display: flex;
              flex-direction: column;
              gap: 16px;
            "></div>

            <!-- Input -->
            <div class="chat-input" style="
              border-top: 1px solid #e5e7eb;
              padding: 16px;
              background: white;
              display: flex;
              gap: 8px;
              align-items: flex-end;
            ">
              <textarea id="chat-input-field" placeholder="Type your message..." style="
                flex: 1;
                resize: none;
                border: 1px solid #d1d5db;
                border-radius: 12px;
                padding: 12px 16px;
                font-size: 14px;
                max-height: 128px;
                font-family: inherit;
                outline: none;
              " rows="1"></textarea>
              <button id="send-btn" style="
                background-color: ${this.config.primaryColor};
                color: white;
                border: none;
                border-radius: 12px;
                width: 48px;
                height: 48px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.2s;
                flex-shrink: 0;
              ">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>

            <!-- Branding -->
            <div style="
              padding: 8px 16px;
              text-align: center;
              font-size: 12px;
              color: #9ca3af;
              background: #f9fafb;
              border-top: 1px solid #e5e7eb;
            ">
              Powered by AI
            </div>
          </div>
        </div>
      `;

      document.body.insertAdjacentHTML('beforeend', widgetHTML);
      this.attachEventListeners();
    },

    /**
     * Attach event listeners
     */
    attachEventListeners: function() {
      const bubbleBtn = document.getElementById('chat-bubble-btn');
      const closeBtn = document.getElementById('close-chat-btn');
      const sendBtn = document.getElementById('send-btn');
      const inputField = document.getElementById('chat-input-field');

      bubbleBtn.addEventListener('click', () => this.openChat());
      closeBtn.addEventListener('click', () => this.closeChat());
      sendBtn.addEventListener('click', () => this.sendMessage());
      
      inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });

      // Auto-resize textarea
      inputField.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 128) + 'px';
      });
    },

    /**
     * Open chat window
     */
    openChat: function() {
      const bubble = document.getElementById('chat-bubble-btn');
      const window = document.getElementById('chat-window');
      
      bubble.style.display = 'none';
      window.style.display = 'flex';
      this.isOpen = true;

      // Focus input
      document.getElementById('chat-input-field').focus();
      
      // Dispatch custom event
      document.dispatchEvent(new CustomEvent('chatWidgetOpened'));
    },

    /**
     * Close chat window
     */
    closeChat: function() {
      const bubble = document.getElementById('chat-bubble-btn');
      const window = document.getElementById('chat-window');
      
      bubble.style.display = 'flex';
      window.style.display = 'none';
      this.isOpen = false;
    },

    /**
     * Validate domain
     */
    isValidDomain: function() {
      const currentDomain = window.location.hostname;
      return this.config.allowedDomains.some(domain => 
        currentDomain === domain || currentDomain.endsWith('.' + domain)
      );
    },

    /**
     * Send message
     */
    sendMessage: async function() {
      const inputField = document.getElementById('chat-input-field');
      const message = inputField.value.trim();

      if (!message || this.isLoading) return;

      // Validate domain
      if (!this.isValidDomain()) {
        alert('This chat widget is not authorized for this domain.');
        return;
      }

      // Add user message
      this.addMessage({
        text: message,
        sender: 'user',
        timestamp: new Date()
      });

      inputField.value = '';
      inputField.style.height = 'auto';
      this.isLoading = true;

      // Show loading indicator
      this.addLoadingIndicator();

      try {
        const response = await fetch(this.config.webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: message,
            domain: window.location.hostname,
            timestamp: new Date().toISOString()
          })
        });

        const data = await response.json();
        
        // Remove loading indicator
        this.removeLoadingIndicator();

        // Add bot response
        this.addMessage({
          text: data.message || data.response || 'Sorry, I could not process that.',
          sender: 'bot',
          timestamp: new Date()
        });

        // Dispatch custom event
        document.dispatchEvent(new CustomEvent('chatMessageSent', {
          detail: { messageLength: message.length }
        }));

      } catch (error) {
        console.error('Error sending message:', error);
        this.removeLoadingIndicator();
        
        this.addMessage({
          text: 'Sorry, there was an error. Please try again.',
          sender: 'bot',
          timestamp: new Date()
        });
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Add message to chat
     */
    addMessage: function(msg) {
      this.messages.push(msg);
      const messagesContainer = document.getElementById('chat-messages');
      
      const messageDiv = document.createElement('div');
      messageDiv.style.display = 'flex';
      messageDiv.style.justifyContent = msg.sender === 'user' ? 'flex-end' : 'flex-start';

      const bubbleColor = msg.sender === 'user' ? this.config.primaryColor : 'white';
      const textColor = msg.sender === 'user' ? 'white' : '#1f2937';
      const borderRadius = msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px';

      messageDiv.innerHTML = `
        <div style="
          max-width: 80%;
          background-color: ${bubbleColor};
          color: ${textColor};
          padding: 12px 16px;
          border-radius: ${borderRadius};
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        ">
          <p style="margin: 0; font-size: 14px; line-height: 1.5; white-space: pre-wrap;">${this.escapeHtml(msg.text)}</p>
          <p style="margin: 4px 0 0 0; font-size: 11px; opacity: 0.7;">
            ${msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      `;

      messagesContainer.appendChild(messageDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },

    /**
     * Add loading indicator
     */
    addLoadingIndicator: function() {
      const messagesContainer = document.getElementById('chat-messages');
      const loadingDiv = document.createElement('div');
      loadingDiv.id = 'loading-indicator';
      loadingDiv.style.display = 'flex';
      loadingDiv.style.justifyContent = 'flex-start';

      loadingDiv.innerHTML = `
        <div style="
          background: white;
          padding: 12px 16px;
          border-radius: 16px 16px 16px 4px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        ">
          <svg class="loading-spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2">
            <line x1="12" y1="2" x2="12" y2="6"></line>
            <line x1="12" y1="18" x2="12" y2="22"></line>
            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
            <line x1="2" y1="12" x2="6" y2="12"></line>
            <line x1="18" y1="12" x2="22" y2="12"></line>
            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
            <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
          </svg>
        </div>
      `;

      messagesContainer.appendChild(loadingDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },

    /**
     * Remove loading indicator
     */
    removeLoadingIndicator: function() {
      const loadingDiv = document.getElementById('loading-indicator');
      if (loadingDiv) {
        loadingDiv.remove();
      }
    },

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml: function(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  };

  // Expose to global scope
  window.AIChatWidget = AIChatWidget;

})();