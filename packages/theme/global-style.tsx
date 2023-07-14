/// <reference types="next" />

export const GlobalStyle = () => (
  <style jsx global>{`
    html,
    body {
      padding: 0;
      margin: 0;
      font-family:
        Inter,
        -apple-system,
        BlinkMacSystemFont,
        Segoe UI,
        Roboto,
        Oxygen,
        Ubuntu,
        Cantarell,
        Fira Sans,
        Droid Sans,
        Helvetica Neue,
        sans-serif;
    }

    html {
      overflow: hidden;
    }

    body {
      /* overflow-x: hidden; */
    }

    * {
      box-sizing: border-box;
    }

    #__next {
    }

    *::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    * {
      scrollbar-width: thin;
      scrollbar-color: hsl(var(--gray6));
    }

    *::-webkit-scrollbar-thumb {
      box-shadow: inset 0 0 16px 16px hsl(var(--gray6));
    }

    *::-webkit-scrollbar {
      width: 12px;
      height: 12px;
    }

    *::-webkit-scrollbar-track {
      margin: 0;
      width: 24px;
      background-color: hsl(var(--gray2));
    }

    *::-webkit-scrollbar-corner {
      width: auto;
    }

    input[type="number"]::-webkit-outer-spin-button,
    input[type="number"]::-webkit-inner-spin-button,
    input[type="number"] {
      -webkit-appearance: none;
      margin: 0;
      -moz-appearance: textfield !important;
    }
  `}</style>
)
