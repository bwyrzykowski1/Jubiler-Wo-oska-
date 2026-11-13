import React from 'react';
import { Bell, BellOff, Check, Send } from 'lucide-react';
import type { Announcement } from '../hooks/usePushNotifications';

interface PushNotificationPanelProps {
  isSubscribed: boolean;
  selectedTopics: string[];
  isLoading: boolean;
  statusMessage: string | null;
  announcements: Announcement[];
  onToggleTopic: (topic: string) => void;
  onSubscribe: () => Promise<boolean>;
  onUnsubscribe: () => Promise<void>;
  onSendTest: () => Promise<void>;
}

const TOPIC_OPTIONS = [
  'Pierścionki',
  'Naszyjniki',
  'Kamienie kolekcjonerskie',
];

export const PushNotificationPanel: React.FC<PushNotificationPanelProps> = ({
  isSubscribed,
  selectedTopics,
  isLoading,
  statusMessage,
  announcements,
  onToggleTopic,
  onSubscribe,
  onUnsubscribe,
  onSendTest,
}) => {
  return (
    <section
      aria-labelledby="push-heading"
      className="border-t border-[#E6E2D8] bg-[#F3F1EC] py-14 md:py-16"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-7">
            <p className="text-xs font-medium tracking-wider text-[#735830] uppercase">
              Powiadomienia o nowościach
            </p>
            <h2
              id="push-heading"
              className="mt-2 text-3xl md:text-4xl font-medium text-[#18181B] tracking-tight"
            >
              Pierwsze spojrzenie na nowe wzory z pracowni
            </h2>
            <p className="mt-3 max-w-xl text-sm md:text-base text-[#57534E] leading-relaxed">
              Wiele projektów z naturalnymi szafirami, szmaragdami i tanzanitami powstaje jako
              pojedyncze egzemplarze. Włącz powiadomienia push, aby otrzymywać alert w momencie
              pojawienia się nowej serii.
            </p>

            <div className="mt-6">
              <p className="text-xs font-medium text-[#18181B] mb-2.5">
                Wybierz interesujące kategorie powiadomień:
              </p>
              <div className="flex flex-wrap gap-2">
                {TOPIC_OPTIONS.map((topic) => {
                  const active = selectedTopics.includes(topic);
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => onToggleTopic(topic)}
                      className={`inline-flex items-center gap-1.5 border px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        active
                          ? 'border-[#18181B] bg-[#18181B] text-white'
                          : 'border-[#D6D1C7] bg-white text-[#18181B] hover:border-[#18181B]'
                      }`}
                    >
                      {active && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                      {topic}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {!isSubscribed ? (
                <button
                  type="button"
                  onClick={onSubscribe}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 bg-[#18181B] px-5 py-2.5 text-xs font-medium text-white transition-colors hover:bg-[#27272A] disabled:opacity-60 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Bell className="h-4 w-4" aria-hidden="true" />
                  {isLoading ? 'Aktywowanie...' : 'Włącz powiadomienia push'}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onSendTest}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 bg-[#735830] px-5 py-2.5 text-xs font-medium text-white transition-colors hover:bg-[#5E4725] disabled:opacity-60 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" aria-hidden="true" />
                    Wyślij powiadomienie testowe
                  </button>
                  <button
                    type="button"
                    onClick={onUnsubscribe}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 border border-[#D6D1C7] bg-white px-4 py-2.5 text-xs font-medium text-[#57534E] transition-colors hover:border-[#18181B] hover:text-[#18181B] whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <BellOff className="h-3.5 w-3.5" aria-hidden="true" />
                    Wyłącz alerty
                  </button>
                </>
              )}
            </div>

            {statusMessage && (
              <p className="mt-4 text-xs text-[#18181B] bg-white border border-[#E6E2D8] px-3.5 py-2.5 max-w-lg">
                {statusMessage}
              </p>
            )}
          </div>

          <div className="lg:col-span-5 bg-white border border-[#E6E2D8] p-6">
            <div className="flex items-center justify-between border-b border-[#E6E2D8] pb-3">
              <h3 className="text-lg font-medium text-[#18181B]">
                Ostatnie nowości w ofercie
              </h3>
              <span className="text-xs text-[#57534E]">
                {isSubscribed ? 'Alerty aktywne' : 'Alerty wyłączone'}
              </span>
            </div>
            <ul className="divide-y divide-[#E6E2D8]">
              {announcements.map((item) => (
                <li key={item.id} className="py-4 first:pt-4 last:pb-0">
                  <div className="flex items-center gap-2 text-xs text-[#57534E]">
                    <span>{item.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{item.publishedAt}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-[#18181B]">{item.title}</p>
                  <p className="mt-1 text-xs text-[#57534E] leading-relaxed">{item.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
