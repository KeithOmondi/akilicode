import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const NotFound = () => {
  const { t } = useTranslation();
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="ds-card max-w-md w-full text-center">
        <p className="text-6xl font-extrabold text-brand-600" aria-hidden="true">404</p>
        <h1 className="text-2xl font-bold mt-2">{t("notFound.title")}</h1>
        <p className="text-ink-700 mt-2 mb-6">{t("notFound.body")}</p>
        <Link to="/" className="ds-btn ds-btn-primary">{t("notFound.home")}</Link>
      </div>
    </main>
  );
};

export default NotFound;
