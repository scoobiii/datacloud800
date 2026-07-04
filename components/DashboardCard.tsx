/**
 * @file DashboardCard.tsx
 * @description Generic card component for dashboard widgets, providing a consistent header with title, icon, optional action controls, and maximize/minimize functionality.
 * @version 1.1.0
 * @date 2024-08-05
 * @author Senior DevOps Team
 * @productowner Edivaldo Beringela (Prefeitura de Mauá)
 * 
 * @changelog
 * v1.1.0 - 2024-08-05
 *   - Fixed layout bug where action controls and maximize button were mutually exclusive.
 *   - Now renders both action controls (via `action` prop) and maximize button side-by-side when applicable.
 *   - Improved accessibility with proper ARIA labels and focus rings.
 *   - Added responsive spacing and consistent hover/focus states.
 * 
 * v1.0.0 - 2024-07-20
 *   - Initial implementation of generic dashboard card with title, icon, and optional maximize toggle.
 * 
 * @responsibility
 * Provides a reusable, accessible, and consistent container for all dashboard widgets.
 * Ensures UI coherence and supports full-screen expansion for data-intensive visualizations.
 * 
 * @signature
 * GOS7 (Gang of Seven Senior Full Stack DevOps Agile Scrum Team)
 * - Claude, Grok, Gemini, Qwen, DeepSeek, GPT, Manus
 */
import React from 'react';

interface DashboardCardProps {
  /** Card title displayed in the header */
  title: string;
  /** Icon rendered next to the title */
  icon: React.ReactNode;
  /** Card content (typically a data visualization) */
  children: React.ReactNode;
  /** Enables maximize/minimize toggle button */
  isMaximizable?: boolean;
  /** Indicates if the card is currently maximized */
  isMaximized?: boolean;
  /** Callback to toggle maximize state */
  onToggleMaximize?: () => void;
  /** Optional custom action controls (e.g., metric selector) */
  action?: React.ReactNode;
  /** Optional custom CSS classes for the card container */
  className?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  icon,
  children,
  isMaximizable = false,
  isMaximized = false,
  onToggleMaximize,
  action,
  className,
}) => {
  return (
    <div 
      className={`bg-gray-900 rounded-lg border border-gray-700 flex flex-col ${
        isMaximized ? 'h-full' : ''
      } ${className || ''}`}
      role="region"
      aria-label={`${title} ${isMaximized ? 'maximized' : 'normal view'}`}
    >
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {icon}
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>

        <div className="flex items-center space-x-2">
          {/* Render custom action controls if provided */}
          {action && <div>{action}</div>}

          {/* Render maximize/minimize button if enabled */}
          {isMaximizable && onToggleMaximize && (
            <button
              onClick={onToggleMaximize}
              className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors"
              aria-label={isMaximized ? 'Minimize widget' : 'Maximize widget'}
              title={isMaximized ? 'Minimize' : 'Maximize'}
            >
              {isMaximized ? (
                // Minimize icon
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm1 3a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              ) : (
                // Maximize icon
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM6 9a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="flex-grow p-4 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default DashboardCard;