import {
  doc,
  getDoc,
} from "firebase/firestore";

import { db } from "../firebase/firebase";


export const defaultTheme = {
  name: "gold",
  primary: "#d4af37",
  secondary: "#b8860b",
};


export const applyWebsiteTheme = (
  theme = defaultTheme
) => {

  const primary =
    theme.primary ||
    defaultTheme.primary;

  const secondary =
    theme.secondary ||
    defaultTheme.secondary;


  const root =
    document.documentElement;


  root.style.setProperty(
    "--theme-primary",
    primary
  );

  root.style.setProperty(
    "--theme-secondary",
    secondary
  );

  root.style.setProperty(
    "--theme-primary-light",
    `${primary}22`
  );

  root.style.setProperty(
    "--theme-primary-soft",
    `${primary}12`
  );

  root.style.setProperty(
    "--theme-gradient",
    `linear-gradient(
      135deg,
      ${primary},
      ${secondary}
    )`
  );

  root.setAttribute(
    "data-theme",
    theme.name || "custom"
  );
};


export const loadWebsiteTheme =
  async () => {

    try {

      const ref = doc(
        db,
        "websiteSettings",
        "main"
      );

      const snapshot =
        await getDoc(ref);


      if (
        snapshot.exists()
      ) {

        const data =
          snapshot.data();

        const theme = {
          ...defaultTheme,
          ...(data.theme || {}),
        };

        applyWebsiteTheme(
          theme
        );

      } else {

        applyWebsiteTheme(
          defaultTheme
        );

      }

    } catch (error) {

      console.error(
        "Theme Load Error:",
        error
      );

      applyWebsiteTheme(
        defaultTheme
      );

    }

  };