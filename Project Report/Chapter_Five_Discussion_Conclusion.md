# CHAPTER FIVE

## DISCUSSION, CONCLUSION AND RECOMMENDATIONS

### 5.0 Introduction

This final chapter pulls the project together. It summarises what was done, weighs the results against the objectives set out at the start, takes an honest look at the strengths and weaknesses of the system that was built, draws a conclusion, and points to the work that should come next.

### 5.1 Summary of Findings

The project started from a gap. The marketplaces students already reach for tend to assume payment methods many Ghanaian learners do not use, or they leave content checks until after the harm is done, or, in the case of smaller home-grown systems, they quietly drop the security and money-handling work that a marketplace actually needs. So the aim was to build something that did none of those things: a secure, web-based e-learning marketplace with role-based course management, local payment, automated assessment, and a transparent split of revenue.

Six objectives grew out of that aim, and each one produced something you can point at.

Role separation came first. Students, instructors, and administrators are kept apart at every layer of the system, through a route guard, a role check on every server action, and one shared function that decides course access. The system was poked on purpose during testing, by signing in as a student and typing an admin address straight into the browser. It pushed back. Access stayed where it belonged.

The approval workflow was next. A course travels through draft, pending, approved, and published, with reject and hide sitting off to the side. Instructors build whatever they like while a course is in draft. Nothing reaches a paying student until an administrator has looked at it and said yes.

Then account security. Passwords live only as bcrypt hashes, never in readable form. Logins and other sensitive actions are throttled from the database, a password change wipes old sessions, and anything sensitive lands in an audit log. The attempts to break these during testing went nowhere, which was rather the point.

Payment and revenue sharing made up the fourth objective. Paystack handles the money. The instructor-and-platform split is worked out at the moment of sale, and the instructor is credited inside a transaction that cannot pay twice, however many times a confirmation happens to arrive.

The fifth was assessment. Quizzes are timed, they grade themselves, and they are pinned to a signed token so the clock cannot be cheated. A pass flows straight into a single progress figure that blends lessons and quizzes together.

Evaluation was the sixth, and Chapter Four is where it lives: three levels of testing, with the mapped cases passing.

### 5.2 Interpretation of Results and Whether Objectives Were Achieved

So, can a small team build a genuinely secure, locally payable, properly governed course marketplace out of free, modern tools? On the evidence here, yes. All six objectives were met inside the scope that was set. Where the system came up short, it was not the design that gave way but the budget. Nobody measured how it behaves under load, and the payment path ran in a sandbox rather than with real money at volume.

A caveat is only fair. The testing shows two things, and just two. It shows the system does the right thing for the journeys people actually take, and it shows the system refuses the misuse it was built to refuse. What it cannot show is how the platform copes with thousands of users at once, because that was never tried. The claims here lean hard on correctness and security. They stay humble about scale.

### 5.3 Comparison with Existing Systems

Where does the platform sit next to the systems from Chapter Two? Roughly in the gap they leave between them. It is an open marketplace in the Udemy sense, with independent instructors publishing and earning, but it adds the thing Udemy lacks for this market: a human approval step before money changes hands, and payment that local learners can actually use. Coursera vets its content too. It does that, though, by partnering with named institutions and shutting the door on the lone expert, and this platform keeps that door open. Moodle can be self-hosted cheaply and keeps data under the operator's control, which is no small thing, yet Moodle was never a marketplace and has to be dragged into becoming one; here, payments, payouts, and revenue sharing were present from the first commit. And against the smaller local projects that demonstrate beautifully but skip the unglamorous security and money work, this one treats that work as the main event.

### 5.4 Advantages of the Proposed System

Several advantages stand out:

- **Local payability**, which lowers the single biggest barrier for the target users.
- **Governed openness**, the combination of an open instructor model with enforced content review, which builds trust without locking people out.
- **Security by default**, with hashing, rate limiting, signed assessments, idempotent payments, and a full audit trail built in rather than added later.
- **Transparency of money**, where every sale records its split and every earning and withdrawal is logged, so instructors always know where they stand.
- **Low cost to run**, since the whole system is built on free and open tooling and free-tier hosting.

### 5.5 Challenges Encountered

None of this came easily. The framework version was very new, so a lot of the old patterns and tutorials simply did not apply, and time went into reading current documentation instead of leaning on memory. The payment flow was the stubborn one. Making confirmation idempotent, so the browser callback and the server webhook could not both let a student in, took several goes before it was right. The quiz timer caused its own headache; an early client-side version could be tampered with, which forced a redesign around a server-signed token. And carrying the whole thing alone, front end, back end, database, security, inside one academic year, meant saying no to features almost as often as yes.

### 5.6 Implications and Contribution of the Study

For practice, the project shows that an affordable, locally payable, trustworthy course marketplace is within reach of a small team, which matters for anyone trying to widen access to digital-skills training in Ghana and similar settings. For the academic field, it adds a documented, end-to-end worked example of how the harder parts of such a system, the approval workflow, the idempotent payment-to-enrolment flow, the signed assessment sessions, and the audit trail, fit together. The literature flags the demand and the importance of trust and security; this work contributes a concrete account of how to satisfy them on a modest budget.

### 5.7 Limitations of the Study

A few limitations should temper the conclusions. Time constrained the scope to a deliverable rather than exhaustive system. Cost confined the work to free tiers and the payment provider's test mode, so performance under heavy production load was not observed. And user-acceptance testing drew on a small group of testers rather than a large, varied sample under real-world network conditions across the country, so the usability findings should be read with that sample size in mind. None of these undoes the core results, but each marks the edge of what the study can claim.

### 5.8 Recommendations for Future Work

The limitations point fairly directly at the work that should follow.

- **Load and scale testing.** Run the platform under realistic concurrency and measure it, then tune the database and hosting accordingly. This addresses the empirical gap left by the present study.
- **Live payment operation.** Move the payment integration from test mode to live, with reconciliation reporting, and study real transaction behaviour and failure handling.
- **Broader user study.** Evaluate usability and learning outcomes with a larger, more representative group of Ghanaian learners and instructors under real network conditions, which would address the contextual gap.
- **Richer assessment.** Extend automated grading beyond objective questions toward short-answer or coding assessment, which the current design deliberately set aside.
- **Offline and mobile resilience.** Add content caching and a lighter data footprint to cope with intermittent connectivity, and consider a dedicated mobile application.
- **Recommendation and analytics.** Introduce course recommendation and richer learning analytics, the kinds of AI-driven features placed outside the scope of this project.

Pursued together, these would take the platform from a proven, secure prototype toward a service ready for sustained real-world use.
