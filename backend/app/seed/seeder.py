from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.models import (
    Jurisdiction, Court, CaseDocument, Statute, StatuteSection,
    SummaryCard, DailyLaw, PushSubscription, EngineConfig
)

def seed_database(db: Session):
    """
    Seeds database with verified Indian jurisprudence, landmark SC rulings,
    BNS/BNSS bare acts, daily legal flashcards, and mock HITL triage queues.
    """
    if db.query(Jurisdiction).first():
        return # Already seeded

    # 1. Jurisdiction
    india = Jurisdiction(id="in", name="India", currency="INR")
    db.add(india)
    db.flush()

    # 2. Courts
    sc = Court(id="sc_in", jurisdiction_id="in", name="Supreme Court of India", short_code="SC", level="SUPREME", website_url="https://sci.gov.in")
    dhc = Court(id="delhi_hc", jurisdiction_id="in", name="High Court of Delhi", short_code="DHC", level="HIGH_COURT", website_url="https://delhihighcourt.nic.in")
    bhc = Court(id="bombay_hc", jurisdiction_id="in", name="High Court of Bombay", short_code="BHC", level="HIGH_COURT", website_url="https://bombayhighcourt.nic.in")
    nclat = Court(id="nclat_in", jurisdiction_id="in", name="National Company Law Appellate Tribunal", short_code="NCLAT", level="TRIBUNAL", website_url="https://nclat.nic.in")
    db.add_all([sc, dhc, bhc, nclat])
    db.flush()

    # 3. Statutes
    bns = Statute(id="BNS", act_name="Bharatiya Nyaya Sanhita, 2023", year=2023, short_code="BNS")
    bnss = Statute(id="BNSS", act_name="Bharatiya Nagarik Suraksha Sanhita, 2023", year=2023, short_code="BNSS")
    ni_act = Statute(id="NI_ACT", act_name="Negotiable Instruments Act, 1881", year=1881, short_code="NI Act")
    pmla = Statute(id="PMLA", act_name="Prevention of Money Laundering Act, 2002", year=2002, short_code="PMLA")
    const = Statute(id="CONST", act_name="Constitution of India", year=1950, short_code="Constitution")
    db.add_all([bns, bnss, ni_act, pmla, const])
    db.flush()

    # 4. Statute Sections
    sections = [
        StatuteSection(
            statute_id="BNS",
            section_number="103",
            title="Punishment for Murder",
            bare_act_text="Whoever commits murder shall be punished with death or imprisonment for life, and shall also be liable to fine. When a group of five or more persons acting in concert commits murder on the ground of race, caste or community, sex, place of birth, language, personal belief or any other similar ground, each member of such group shall be punished with death or with imprisonment for life.",
            layman_explanation="Replaces Section 302 of the old IPC. Lays down mandatory death penalty or life imprisonment for murder, with special severe provisions against mob lynching."
        ),
        StatuteSection(
            statute_id="BNSS",
            section_number="47",
            title="Arrest to be made strictly according to the Sanhita",
            bare_act_text="No arrest shall be made except in accordance with the provisions of this Sanhita or any other law for the time being in force. Every police officer or other person making any arrest shall forthwith give information regarding such arrest and place where the person is held to designated relatives or friends.",
            layman_explanation="Ensures police cannot arrest anyone arbitrarily. Police must inform your nominated family member immediately and explain exact grounds of arrest."
        ),
        StatuteSection(
            statute_id="NI_ACT",
            section_number="138",
            title="Dishonour of cheque for insufficiency, etc., of funds in the account",
            bare_act_text="Where any cheque drawn by a person on an account maintained by him with a banker for payment of any amount of money to another person from out of that account for the discharge, in whole or in part, of any debt or other liability, is returned by the bank unpaid, such person shall be deemed to have committed an offence.",
            layman_explanation="Criminalizes cheque bounce provided the cheque was issued to repay a legally enforceable debt, and a legal demand notice was served within 30 days."
        ),
        StatuteSection(
            statute_id="PMLA",
            section_number="45",
            title="Offences to be cognizable and non-bailable",
            bare_act_text="No person accused of an offence under this Act shall be released on bail unless the Public Prosecutor has been given an opportunity to oppose, and where the Public Prosecutor opposes the application, the court is satisfied that there are reasonable grounds for believing that he is not guilty and not likely to commit any offence.",
            layman_explanation="Creates the stringent 'twin conditions' for bail under money laundering laws, requiring courts to believe the accused is innocent before granting bail."
        ),
        StatuteSection(
            statute_id="CONST",
            section_number="21",
            title="Protection of life and personal liberty",
            bare_act_text="No person shall be deprived of his life or personal liberty except according to procedure established by law.",
            layman_explanation="The fundamental right to personal freedom, privacy, fair trial, and speedy justice. Often used by courts to grant bail when trials are unduly delayed."
        )
    ]
    db.add_all(sections)
    db.flush()

    # 5. Published Landmark Summary Cards (Inshorts style)
    cards = [
        SummaryCard(
            court_name="Supreme Court of India",
            category="Criminal Law",
            headline="Article 21 Speedy Trial Rights Prevail Over PMLA Section 45 Twin Bail Conditions: SC",
            advocate_summary="A three-judge bench held that prolonged incarceration without trial violates Article 21 of the Constitution, which cannot be eclipsed by the statutory embargo of Section 45 PMLA. The Court observed that where prolonged delay is not attributable to the accused, constitutional courts must lean towards personal liberty. High Court order denying bail was quashed, and regular bail was granted.",
            citizen_summary="The Supreme Court ruled that the right to a speedy trial protects personal liberty above all else. If you are jailed under money laundering charges but authorities take years to finish the trial, courts can grant you bail even if money laundering bail rules are very strict.",
            ratio_decidendi="Prolonged pre-trial detention violates Article 21 and supersedes statutory twin bail conditions under Section 45 PMLA.",
            holding="Allowed",
            citation="2026 INSC 388",
            bench="Gavai J., Kant J., Sharma J.",
            related_sections=[{"act": "PMLA", "section": "45"}, {"act": "Constitution", "section": "21"}],
            status="PUBLISHED",
            publish_mode="HITL",
            confidence_score=0.98,
            is_breaking=True,
            views_count=1420,
            shares_count=312,
            published_at=datetime.utcnow() - timedelta(minutes=45)
        ),
        SummaryCard(
            court_name="Supreme Court of India",
            category="Commercial / NI Act",
            headline="Section 138 NI Act Inapplicable To Time-Barred Debts Without Written Promise: SC",
            advocate_summary="A division bench ruled that a cheque issued for a time-barred debt does not constitute a legally enforceable liability under Section 138 of the NI Act, in absence of an express written acknowledgment conforming to Section 25(3) of the Indian Contract Act. The High Court's refusal to exercise Section 482 powers was reversed, and the criminal complaint was quashed.",
            citizen_summary="If someone gives a cheque to repay a loan that has already expired under the 3-year limitation law, they cannot be criminally prosecuted for cheque bounce unless they had separately signed a fresh written promise to pay.",
            ratio_decidendi="Cheque for time-barred debt is not a legally enforceable debt under Section 138 NI Act absent a Section 25(3) Contract Act acknowledgment.",
            holding="Allowed",
            citation="2026 INSC 412",
            bench="Nagarathna J., Mehta J.",
            related_sections=[{"act": "NI Act", "section": "138"}],
            status="PUBLISHED",
            publish_mode="AUTOMATED",
            confidence_score=0.97,
            is_breaking=False,
            views_count=980,
            shares_count=145,
            published_at=datetime.utcnow() - timedelta(hours=3)
        ),
        SummaryCard(
            court_name="High Court of Delhi",
            category="Criminal Procedure",
            headline="Offences Prior To July 1, 2024 Must Be Charged Under IPC, Not BNS: Delhi HC",
            advocate_summary="Single judge bench clarified that substantive criminal offenses committed prior to July 1, 2024 must strictly be registered and prosecuted under the Indian Penal Code, 1860 by virtue of Article 20(1) ex-post facto protections. However, procedural inquiries may incorporate BNSS safeguards. FIR registered under BNS for a 2023 incident was directed to be amended.",
            citizen_summary="The Delhi High Court declared that crimes that happened before July 1, 2024 cannot be charged under the new Bharatiya Nyaya Sanhita (BNS). Police must charge under the old IPC, protecting citizens from retroactively applied new laws.",
            ratio_decidendi="Article 20(1) bars retroactive substantive penal liability under BNS 2023 for offenses committed prior to commencement date.",
            holding="Allowed",
            citation="2026 DHC 184",
            bench="Sharma J.",
            related_sections=[{"act": "BNS", "section": "103"}, {"act": "BNSS", "section": "47"}],
            status="PUBLISHED",
            publish_mode="HITL",
            confidence_score=0.95,
            is_breaking=False,
            views_count=730,
            shares_count=98,
            published_at=datetime.utcnow() - timedelta(hours=6)
        ),
        SummaryCard(
            court_name="Supreme Court of India",
            category="Corporate / Arbitration",
            headline="Unstamped Arbitration Agreements Do Not Invalidate Referral Stage: 7-Judge Bench",
            advocate_summary="In a landmark unanimous judgment, a 7-judge Constitution Bench held that insufficiency of stamping does not render an arbitration agreement void ab initio. The issue of stamping falls exclusively within the arbitral tribunal's jurisdiction under Section 16 of the Arbitration and Conciliation Act. Earlier contrary rulings in NN Global were overruled.",
            citizen_summary="The Supreme Court made business disputes much faster to resolve. Even if an agreement didn't have adequate government stamp duty paid, the dispute can still be sent to arbitration immediately without getting stuck in court for years.",
            ratio_decidendi="Non-stamping or insufficient stamping is a curable defect and does not prevent appointment of arbitrator under Section 11(6).",
            holding="Allowed",
            citation="2024 INSC 988",
            bench="Chandrachud CJI, Kaul J., Sanjiv Khanna J., Gavai J., Surya Kant J., Sundresh J., Manoj Misra J.",
            related_sections=[],
            status="PUBLISHED",
            publish_mode="HITL",
            confidence_score=0.99,
            is_breaking=True,
            views_count=3200,
            shares_count=820,
            published_at=datetime.utcnow() - timedelta(days=1)
        )
    ]
    db.add_all(cards)
    db.flush()

    # 6. Pending HITL Triage Cards (For the Admin to inspect and approve)
    triage_cards = [
        SummaryCard(
            court_name="Supreme Court of India",
            category="Taxation / GST",
            headline="Input Tax Credit Cannot Be Denied Solely Due To Supplier Default: SC",
            advocate_summary="Bench observed that bona fide purchasing dealers who paid GST on genuine invoices cannot be denied Input Tax Credit under Section 16(2)(c) CGST Act solely because the supplier defaulted in remitting tax, unless collusion is established. Department's arbitrary recovery was set aside.",
            citizen_summary="The Supreme Court protected honest shopkeepers and business owners. If you paid GST to a supplier with a proper bill, tax officers cannot punish you or seize your input credit just because that supplier ran away with the tax money.",
            ratio_decidendi="Purchasing dealer cannot be penalized for vendor's statutory remittance default absent proof of fraud or collusion.",
            holding="Allowed",
            citation="2026 INSC 429",
            bench="Nagarathna J., Ujjal Bhuyan J.",
            related_sections=[],
            status="IN_REVIEW",
            publish_mode="HITL",
            confidence_score=0.91,
            flag_reason="High-impact tax judgment awaiting senior tax editor verification",
            is_breaking=True,
            created_at=datetime.utcnow() - timedelta(minutes=15)
        ),
        SummaryCard(
            court_name="High Court of Bombay",
            category="Consumer Rights",
            headline="E-Commerce Platforms Held Jointly Liable For Defective Goods Sold By Third-Party Vendors",
            advocate_summary="Division bench ruled that digital marketplaces cannot claim 'intermediary safe harbor' under Section 79 of IT Act when they control logistics, warranty representations, and payments. Platform was ordered to compensate buyer under Consumer Protection Act, 2019.",
            citizen_summary="Bombay High Court held that major shopping apps cannot wash their hands of fake or defective items by blaming third-party sellers when they handle the delivery and payments. The shopping app is directly liable to refund you.",
            ratio_decidendi="Control over supply chain and transaction flow forfeits Section 79 IT Act safe harbor protection.",
            holding="Allowed",
            citation="2026 BHC 210",
            bench="Patel J., Gokhale J.",
            related_sections=[],
            status="IN_REVIEW",
            publish_mode="HITL",
            confidence_score=0.88,
            flag_reason="Needs citation verification against Consumer Protection Act 2019 rules",
            is_breaking=False,
            created_at=datetime.utcnow() - timedelta(minutes=32)
        )
    ]
    db.add_all(triage_cards)
    db.flush()

    # 7. Daily Law Flashcard ("Know Your Rights")
    daily_law = DailyLaw(
        date=datetime.utcnow().strftime("%Y-%m-%d"),
        topic="Police Arrest Rights",
        headline="Did You Know: Police Must Inform Your Relative Immediately Upon Arrest",
        explanation="Under Section 47 of the Bharatiya Nagarik Suraksha Sanhita (BNSS) and Article 22 of the Constitution, police cannot detain anyone secretly. You have an absolute legal right to have one designated friend or family member notified of your arrest and exact location within 1 hour.",
        practical_tip="Always memorize or write down an emergency contact. If police refuse to notify your contact, mention this directly to the Magistrate at your 24-hour production hearing.",
        statute_reference="BNSS Section 47 & Constitution Art. 22",
        quiz_question="Within how many hours must an arrested person be produced before the nearest judicial magistrate?",
        quiz_options=["12 Hours", "24 Hours (Excluding travel time)", "48 Hours", "No fixed time limit"],
        correct_option_index=1
    )
    db.add(daily_law)

    # 8. Initial Subscriptions & Engine Config
    db.add(PushSubscription(
        endpoint="https://fcm.googleapis.com/fcm/send/sample-token-advocate",
        user_role="advocate",
        topics=["criminal", "breaking"]
    ))
    db.add(PushSubscription(
        endpoint="https://fcm.googleapis.com/fcm/send/sample-token-citizen",
        user_role="citizen",
        topics=["breaking", "daily_law"]
    ))

    db.add(EngineConfig(
        id=1,
        auto_publish_enabled=True,
        confidence_threshold=0.95,
        scraper_status={
            "sc_scraper": {"status": "HEALTHY", "last_run": "10 minutes ago", "cases_parsed": 18},
            "delhi_hc_scraper": {"status": "HEALTHY", "last_run": "25 minutes ago", "cases_parsed": 34},
            "bombay_hc_scraper": {"status": "HEALTHY", "last_run": "40 minutes ago", "cases_parsed": 22},
            "gazette_scraper": {"status": "HEALTHY", "last_run": "1 hour ago", "notifications": 4}
        }
    ))

    db.commit()
