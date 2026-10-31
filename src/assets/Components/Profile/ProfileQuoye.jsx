import "./ProfileQuoye.css";

function ProfileQuoye({ quote = "" }) {
    if (!quote) {
        return null;
    }

    return (
        <section className="profile-quote">
            <div className="profile-quote-icon">
                <i className="bi bi-quote"></i>
            </div>

            <p>{quote}</p>
        </section>
    );
}

export default ProfileQuoye;