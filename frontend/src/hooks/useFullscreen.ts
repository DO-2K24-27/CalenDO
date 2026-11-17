import { useState, useEffect } from 'react';

// Browser fullscreen (F11) doesn't set `document.fullscreenElement` nor fire
// `fullscreenchange`, but it does match the `display-mode: fullscreen` media
// query, so we watch both to cover F11 and the Fullscreen API.
const FULLSCREEN_QUERY = '(display-mode: fullscreen)';

const isFullscreenNow = () =>
  !!document.fullscreenElement || window.matchMedia(FULLSCREEN_QUERY).matches;

export const useFullscreen = () => {
  const [isFullscreen, setIsFullscreen] = useState(isFullscreenNow);

  useEffect(() => {
    const update = () => setIsFullscreen(isFullscreenNow());
    const mediaQuery = window.matchMedia(FULLSCREEN_QUERY);

    document.addEventListener('fullscreenchange', update);
    mediaQuery.addEventListener('change', update);

    return () => {
      document.removeEventListener('fullscreenchange', update);
      mediaQuery.removeEventListener('change', update);
    };
  }, []);

  return isFullscreen;
};
