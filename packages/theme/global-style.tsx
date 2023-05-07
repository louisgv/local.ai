/// <reference types="next" />

export const GlobalStyle = () => (
  <style jsx global>{`
    html,
    body {
      padding: 0;
      margin: 0;
      font-family: Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
        Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
        sans-serif;
    }

    body {
      /* overflow-x: hidden; */
    }

    * {
      box-sizing: border-box;
    }

    #__next {
    }

    * {
      scrollbar-width: thin;
      scrollbar-color: var(--mauve2);
    }

    *::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    body::-webkit-scrollbar-track {
      background-color: var(--mauve2);
    }

    body::-webkit-scrollbar-thumb {
      border: 2px solid var(--mauve2);
    }

    *::-webkit-scrollbar-thumb {
      min-height: 42px;
      background-color: var(--mauve2);
    }
  `}</style>
)
