import { runtimeConfig } from './lib/runtime';

export const APP_UPDATE_EVENT = 'an-study-room:update-available';

type AppUpdateDetail = {
  hasWaitingWorker: boolean;
};

let currentRegistration: ServiceWorkerRegistration | null = null;
let hasRegisteredControllerReload = false;
let hasSeenActiveController = false;

function dispatchAppUpdate(detail: AppUpdateDetail) {
  window.dispatchEvent(
    new CustomEvent<AppUpdateDetail>(APP_UPDATE_EVENT, {
      detail,
    }),
  );
}

function notifyIfWaitingWorker(registration: ServiceWorkerRegistration) {
  if (registration.waiting && navigator.serviceWorker.controller) {
    dispatchAppUpdate({ hasWaitingWorker: true });
  }
}

function watchRegistration(registration: ServiceWorkerRegistration) {
  currentRegistration = registration;
  notifyIfWaitingWorker(registration);

  registration.addEventListener('updatefound', () => {
    const nextWorker = registration.installing;
    if (!nextWorker) return;

    nextWorker.addEventListener('statechange', () => {
      if (nextWorker.state === 'installed' && navigator.serviceWorker.controller) {
        dispatchAppUpdate({ hasWaitingWorker: Boolean(registration.waiting) });
      }
    });
  });
}

function scheduleUpdateChecks(registration: ServiceWorkerRegistration) {
  const checkForUpdate = () =>
    registration
      .update()
      .then(() => notifyIfWaitingWorker(registration))
      .catch(() => undefined);

  void checkForUpdate();
  window.setInterval(checkForUpdate, 5 * 60 * 1000);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      void checkForUpdate();
    }
  });
}

export function requestServiceWorkerRefresh() {
  if (currentRegistration?.waiting) {
    currentRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    return;
  }

  window.location.reload();
}

export function registerServiceWorker() {
  if (!runtimeConfig().enableServiceWorker) return;
  if (!import.meta.env.PROD) return;
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    hasSeenActiveController = Boolean(navigator.serviceWorker.controller);

    if (!hasRegisteredControllerReload) {
      hasRegisteredControllerReload = true;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!hasSeenActiveController) {
          hasSeenActiveController = true;
          return;
        }
        window.location.reload();
      });
    }

    navigator.serviceWorker
      .register('./sw.js')
      .then((registration) => {
        watchRegistration(registration);
        scheduleUpdateChecks(registration);
      })
      .catch((error: unknown) => {
        console.warn('Service worker registration failed.', error);
      });
  });
}
