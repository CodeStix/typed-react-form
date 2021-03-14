import "../styles/globals.css";

// https://stackoverflow.com/questions/57609931/next-js-with-fortawesome-and-ssr
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css"; // Import the CSS
config.autoAddCss = false; // Tell Font Awesome to skip adding the CSS automatically since it's being imported above

function MyApp({ Component, pageProps }) {
    return <Component {...pageProps} />;
}

export default MyApp;
