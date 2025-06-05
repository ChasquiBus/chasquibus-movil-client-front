/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const COLORS = {
    // Colores de la bandera de Ecuador
    ECUADOR_YELLOW: '#FFD100',
    ECUADOR_BLUE: '#0000FF',
    ECUADOR_RED: '#FF0000',

    // Colores de la aplicación
    PRIMARY: '#0000FF',
    BACKGROUND: '#FFFFFF',
    TEXT: {
        PRIMARY: '#000000',
        SECONDARY: '#666666',
    },
    BUTTON: {
        PRIMARY: '#0000FF',
        TEXT: '#FFFFFF',
    },
    DOTS: {
        ACTIVE: '#0000FF',
        INACTIVE: '#D9D9D9',
    }
};
