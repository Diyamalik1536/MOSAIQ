import {
  UsersRound,
  Rocket,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./Footer.css";

const footerGroups = [
  {
    title: "EXPLORE",
    links: [
      { label: "Browse Students", href: "/browse-students" },
      { label: "Discover Projects", href: "/projects" },
      { label: "Find Collaborators", href: "/browse-students" },
      { label: "Explore Skills", href: "/browse-students" },
      { label: "Mentors", href: "/mentors" },
    ],
  },
  {
    title: "FOR STUDENTS",
    links: [
      { label: "Create Your Profile", href: "/profile" },
      { label: "Post a Project", href: "/projects/create" },
      { label: "Find a Team", href: "/browse-students" },
      { label: "Build Your Portfolio", href: "/profile" },
      { label: "Get Mentor Feedback", href: "/mentor" },
    ],
  },
  {
    title: "PLATFORM",
    links: [
      { label: "About MOSAIQ", href: "/about" },
      { label: "How It Works", href: "/how-it-works" },
      { label: "Features", href: "/features" },
      { label: "MOSAIQ Pro", href: "/pro", badge: "NEW" },
      { label: "Community Guidelines", href: "/community-guidelines" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "SUPPORT & LEGAL",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Contact Us", href: "/contact" },
      { label: "FAQs", href: "/#faq" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Report a Problem", href: "/contact" },
    ],
  },
];

const socialLinks = [
  // Add your real profile URLs before enabling these links.
  // Example: { label: "GitHub", href: "https://github.com/your-account", Icon: Github },
  // Example: { label: "LinkedIn", href: "https://linkedin.com/company/your-page", Icon: Linkedin },
];

const highlightIcons = [
  UsersRound,
  Rocket,
  TrendingUp
];

function FooterLink({ link }) {
  const isInternal = link.href.startsWith("/");

  return (
    <li className="tf-footer__link-item">
      {isInternal ? (
        <Link className="tf-footer__link" to={link.href}>
          <span>{link.label}</span>
          {link.badge && (
            <span className="tf-footer__badge">{link.badge}</span>
          )}
        </Link>
      ) : (
        <a className="tf-footer__link" href={link.href}>
          <span>{link.label}</span>
          {link.badge && (
            <span className="tf-footer__badge">{link.badge}</span>
          )}
        </a>
      )}
    </li>
  );
}

export default function Footer() {
  const { t } = useTranslation("site");
  const currentYear = new Date().getFullYear();
  const translatedGroups = t("footer.groups", { returnObjects: true });
  const groups = translatedGroups.map((group, groupIndex) => ({
    ...group,
    links: group.links.map((label, linkIndex) => ({
      label,
      href: footerGroups[groupIndex].links[linkIndex].href,
      badge: groupIndex === 2 && linkIndex === 3 ? t("footer.new") : undefined
    }))
  }));
  const highlights = t("footer.highlights", { returnObjects: true });

  return (
    <footer className="tf-footer">
      <div className="tf-footer__container">
        <div className="tf-footer__main">
          {/* Brand and summary */}
          <div className="tf-footer__brand">
            <Link className="tf-footer__logo" to="/" aria-label={t("footer.logo")}>
              <span className="tf-footer__logo-mark">
                <UsersRound size={25} strokeWidth={2.4} />
              </span>
              <span className="tf-footer__logo-text">
                Talent<span>Forge</span>
              </span>
            </Link>

            <p className="tf-footer__description">
              {t("footer.description")}
            </p>

            <ul className="tf-footer__highlights">
              {highlights.map((label, index) => {
                const Icon = highlightIcons[index];
                return (
                  <li key={label} className="tf-footer__highlight">
                    <span className="tf-footer__highlight-icon">
                      <Icon size={17} strokeWidth={2.2} />
                    </span>
                    <span>{label}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Navigation columns */}
          {groups.map((group) => (
            <nav
              className="tf-footer__group"
              key={group.title}
              aria-label={group.title}
            >
              <h2 className="tf-footer__heading">{group.title}</h2>
              <ul className="tf-footer__links">
                {group.links.map((link) => (
                  <FooterLink key={link.label} link={link} />
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="tf-footer__bottom">
          <p className="tf-footer__copyright">
            {t("footer.copyright", { year: currentYear })}
          </p>

          <nav className="tf-footer__legal" aria-label={t("footer.legalNavigation")}>
            <a href="/privacy">{t("footer.privacy")}</a>
            <a href="/terms">{t("footer.terms")}</a>
            <a href="/community-guidelines">{t("footer.community")}</a>
          </nav>

          {socialLinks.length > 0 && (
            <div className="tf-footer__socials" aria-label={t("footer.social")}>
              {socialLinks.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="tf-footer__social-link"
                >
                  <Icon size={20} strokeWidth={2} />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
