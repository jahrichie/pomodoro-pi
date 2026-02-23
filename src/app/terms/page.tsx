import Link from 'next/link';
import styles from '../privacy/legal.module.css';

export const metadata = {
  title: 'Terms of Service - Pomodoro Pi',
};

export default function TermsOfService() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <Link href="/" className={styles.backLink}>&larr; Back to Timer</Link>

        <h1 className={styles.title}>Terms of Service</h1>
        <p className={styles.updated}>Last updated: February 22, 2026</p>

        <section className={styles.section}>
          <h2>Acceptance of Terms</h2>
          <p>
            By using Pomodoro Pi, you agree to these terms. If you don&apos;t agree, please
            don&apos;t use the app. It&apos;s a timer &mdash; there isn&apos;t much to disagree about.
          </p>
        </section>

        <section className={styles.section}>
          <h2>What This App Does</h2>
          <p>
            Pomodoro Pi is a free, open-source productivity timer. It helps you set focused work
            intervals. It can optionally import event names from your Google Calendar to use as
            timer labels.
          </p>
        </section>

        <section className={styles.section}>
          <h2>No Account Required</h2>
          <p>
            You do not need to create an account to use this app. Google Calendar integration is
            optional and only activated when you explicitly choose to connect.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Your Data</h2>
          <p>
            We don&apos;t collect, store, or process your data. Your tasks are stored locally on
            your device. Google Calendar data is fetched on demand and never persisted beyond your
            browser session. See our <Link href="/privacy">Privacy Policy</Link> for full details.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Google Calendar Access</h2>
          <p>
            If you choose to connect Google Calendar, you grant the app read-only access to your
            calendar events. The app will only read today&apos;s events. You can revoke this access
            at any time from your
            {' '}<a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">Google Account settings</a>.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Disclaimer</h2>
          <p>
            This app is provided &ldquo;as is&rdquo; without warranties of any kind. We make no
            guarantees that the timer will be perfectly accurate, that your tasks will be saved
            indefinitely, or that the app will be available at all times. Use it to be productive,
            but don&apos;t rely on it to land a spacecraft.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, the developers of Pomodoro Pi shall not be
            liable for any damages arising from the use of this app. This includes but is not
            limited to missed deadlines, over-caffeination during Pomodoro sessions, or existential
            crises triggered by watching a timer count down.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Changes to These Terms</h2>
          <p>
            We may update these terms occasionally. The revised version will be posted on this page.
            Continued use of the app after changes constitutes acceptance of the new terms.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Contact</h2>
          <p>
            Questions? Open an issue on the project&apos;s GitHub repository.
          </p>
        </section>
      </div>
    </main>
  );
}
