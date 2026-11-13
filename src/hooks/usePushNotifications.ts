import { useCallback, useEffect, useState } from 'react';

export interface PushNotificationPreview {
  title: string;
  body: string;
  timestamp: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  category: string;
  publishedAt: string;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const STORAGE_KEY = 'jw_push_preferences_v1';

export function usePushNotifications() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    'Pierścionki',
    'Naszyjniki',
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [activeAlert, setActiveAlert] = useState<PushNotificationPreview | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [endpoint, setEndpoint] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { subscribed?: boolean; topics?: string[] };
        if (Array.isArray(parsed.topics) && parsed.topics.length > 0) {
          setSelectedTopics(parsed.topics);
        }
        if (parsed.subscribed) {
          setIsSubscribed(true);
        }
      }
    } catch {
      // Ignore storage errors
    }

    fetch('/api/announcements')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.announcements) {
          setAnnouncements(data.announcements);
        }
      })
      .catch(() => {
        // Ignore offline initial fetch failure
      });

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then(async (reg) => {
          const existing = await reg.pushManager?.getSubscription();
          if (existing) {
            setIsSubscribed(true);
            setEndpoint(existing.endpoint);
          }
        })
        .catch(() => {
          // Ignore SW readiness issue
        });
    }
  }, []);

  const persistPrefs = useCallback((subscribed: boolean, topics: string[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ subscribed, topics }));
    } catch {
      // Ignore storage errors
    }
  }, []);

  const toggleTopic = useCallback(
    (topic: string) => {
      setSelectedTopics((prev) => {
        const next = prev.includes(topic)
          ? prev.filter((item) => item !== topic)
          : [...prev, topic];
        const finalTopics = next.length > 0 ? next : [topic];
        persistPrefs(isSubscribed, finalTopics);
        return finalTopics;
      });
    },
    [isSubscribed, persistPrefs]
  );

  const subscribe = useCallback(async () => {
    setIsLoading(true);
    setStatusMessage(null);

    try {
      let currentPermission: NotificationPermission = 'default';
      if (typeof Notification !== 'undefined') {
        currentPermission =
          Notification.permission === 'granted'
            ? 'granted'
            : await Notification.requestPermission();
        setPermission(currentPermission);
      }

      if (currentPermission === 'denied') {
        setStatusMessage(
          'Powiadomienia są zablokowane w ustawieniach przeglądarki. Odblokuj je w pasku adresu, aby otrzymywać alerty systemowe.'
        );
        setIsLoading(false);
        return false;
      }

      let registeredPush = false;
      if ('serviceWorker' in navigator && 'PushManager' in window && currentPermission === 'granted') {
        try {
          const registration = await Promise.race([
            navigator.serviceWorker.ready,
            new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500)),
          ]);

          if (registration && registration.pushManager) {
            const keyRes = await fetch('/api/push/vapid-public-key');
            if (keyRes.ok) {
              const { publicKey } = (await keyRes.json()) as { publicKey: string };
              const convertedKey = urlBase64ToUint8Array(publicKey);
              let sub = await registration.pushManager.getSubscription();
              if (!sub) {
                sub = await registration.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: convertedKey.buffer as ArrayBuffer,
                });
              }

              const subRes = await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  subscription: sub.toJSON(),
                  topics: selectedTopics,
                }),
              });

              if (subRes.ok) {
                setEndpoint(sub.endpoint);
                registeredPush = true;
              }
            }
          }
        } catch {
          // Embedded iframe or unsupported PushManager falls back cleanly
        }
      }

      setIsSubscribed(true);
      persistPrefs(true, selectedTopics);

      if (registeredPush) {
        setStatusMessage(
          'Subskrypcja powiadomień push została aktywowana. Będziesz otrzymywać informacje o nowych pierścionkach i naszyjnikach.'
        );
      } else {
        setStatusMessage(
          'Powiadomienia o nowościach zostały włączone dla tej przeglądarki.'
        );
      }
      return true;
    } finally {
      setIsLoading(false);
    }
  }, [persistPrefs, selectedTopics]);

  const unsubscribe = useCallback(async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      if ('serviceWorker' in navigator) {
        const registration = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500)),
        ]);
        const sub = await registration?.pushManager?.getSubscription();
        if (sub) {
          await fetch('/api/push/unsubscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: sub.endpoint }),
          }).catch(() => {});
          await sub.unsubscribe();
        }
      }
      setEndpoint(null);
      setIsSubscribed(false);
      persistPrefs(false, selectedTopics);
      setStatusMessage('Powiadomienia o nowościach zostały wyłączone.');
    } finally {
      setIsLoading(false);
    }
  }, [persistPrefs, selectedTopics]);

  const sendTestNotification = useCallback(async () => {
    setIsLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/push/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: endpoint || undefined,
          title: 'Jubiler Wołoska — Nowy wzór w pracowni',
          message: `Nowość w kategorii ${selectedTopics.join(', ')}: Soliter „Mokotów” w złocie 585 z certyfikowanym brylantem.`,
        }),
      });

      const data = (await res.json()) as {
        delivered?: number;
        payload?: { title: string; body: string };
      };

      const title = data?.payload?.title || 'Jubiler Wołoska — Nowość w ofercie';
      const body =
        data?.payload?.body ||
        'W pracowni pojawiły się nowe ręcznie kute pierścionki i naszyjniki.';

      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        if ('serviceWorker' in navigator) {
          const reg = await Promise.race([
            navigator.serviceWorker.ready,
            new Promise<null>((resolve) => setTimeout(() => resolve(null), 1200)),
          ]);
          if (reg && (!data.delivered || data.delivered === 0)) {
            await reg.showNotification(title, {
              body,
              icon: '/pwa-192x192.png',
              tag: 'jubiler-woloska-preview',
            });
          }
        }
      }

      setActiveAlert({
        title,
        body,
        timestamp: new Date().toLocaleTimeString('pl-PL', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      });
    } catch {
      setStatusMessage('Nie udało się wysłać powiadomienia testowego.');
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, selectedTopics]);

  const dismissAlert = useCallback(() => {
    setActiveAlert(null);
  }, []);

  return {
    isSubscribed,
    permission,
    selectedTopics,
    isLoading,
    statusMessage,
    activeAlert,
    announcements,
    toggleTopic,
    subscribe,
    unsubscribe,
    sendTestNotification,
    dismissAlert,
  };
}
