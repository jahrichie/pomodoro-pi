import Link from 'next/link';
import styles from './legal.module.css';

export const metadata = {
  title: 'Privacy Policy - Pomodoro Pi',
};

export default function PrivacyPolicy() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <Link href="/" className={styles.backLink}>&larr; Back to Timer</Link>

        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.updated}>Last updated: February 22, 2026</p>

        <section className={styles.section}>
          <h2>The Short Version</h2>
          <p>
            Pomodoro Pi does not collect, store, transmit, or sell your personal data. Period.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Data We Collect</h2>
          <p>None. We do not collect any personal information, analytics, telemetry, or usage data.</p>
        </section>

        <section className={styles.section}>
          <h2>Google Calendar Integration</h2>
          <p>
            When you choose to connect your Google Calendar, the app requests read-only access to
            your calendar events for the current day. This data is used solely to display event
            names and times so you can import them as timer tasks.
          </p>
          <ul>
            <li>Calendar data is processed entirely in your browser and on your device.</li>
            <li>Calendar data is never stored on any server, database, or third-party service.</li>
            <li>Calendar data is never shared with anyone.</li>
            <li>OAuth tokens are stored in HTTP-only browser cookies on your device and are used
              exclusively to authenticate with the Google Calendar API. They are never logged,
              transmitted elsewhere, or persisted beyond the browser session.</li>
            <li>You can revoke access at any time from your
              {' '}<a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">Google Account permissions</a>.
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Local Storage</h2>
          <p>
            Your task list is saved in your browser&apos;s local storage so it persists across
            page refreshes. This data never leaves your device and is not accessible to us or
            anyone else.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Cookies</h2>
          <p>
            The app uses a small number of HTTP-only cookies solely for Google OAuth authentication.
            No tracking cookies, advertising cookies, or analytics cookies are used.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Third-Party Services</h2>
          <p>
            The only third-party service this app communicates with is the Google Calendar API, and
            only when you explicitly initiate the import. No other external services, analytics
            platforms, or ad networks are used.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Children&apos;s Privacy</h2>
          <p>
            This app does not knowingly collect any information from anyone, including children
            under 13.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Changes to This Policy</h2>
          <p>
            If this policy changes, the updated version will be posted on this page with a
            revised date. Given that we collect no data, changes are unlikely.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Contact</h2>
          <p>
            Questions about this policy? Open an issue on the project&apos;s GitHub repository.
          </p>
        </section>
      </div>
    </main>
  );
}
