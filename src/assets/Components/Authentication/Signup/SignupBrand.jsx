import "./SignupBrand.css";
import { useTranslation } from "react-i18next";

function SignupBrand() {
    const { t } = useTranslation();

    return (
        <div className="main">
            <div className="bg_image">
                <img
                    src={`${import.meta.env.BASE_URL}signup-image.png`}
                    alt=""
                    className="back_image"
                />
            </div>

            <div className="header_logo">
                <img
                    src={`${import.meta.env.BASE_URL}favicon.svg`}
                    alt="MOSAIQ logo"
                    className="signup_logo"
                />

                <span className="signup_brand_name">
                    MOSAIQ
                </span>
            </div>

            <div className="bg_text">
                <h1>
                    {t("auth.signupBrandTitle", "More Than Just a College.")}
                </h1>

                <h3>
                    {t("auth.signupBrandSubtitle", "Join a trusted community where students learn, collaborate, exchange and grow together.")}
                </h3>
            </div>
        </div>
    );
}

export default SignupBrand;
