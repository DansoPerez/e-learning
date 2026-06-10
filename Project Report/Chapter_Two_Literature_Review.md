# CHAPTER TWO

## LITERATURE REVIEW

This chapter looks at the work that already exists around the problem this project sets out to solve. It does not just list what other people have written. It weighs it. The chapter starts wide, defining the core ideas the project rests on, then tightens its focus onto the systems and technologies that matter most, the methods and models that shape the design, and finally the gaps that justify building another platform. Throughout, the guiding question after each point is a blunt one: and so what? What does it mean for a secure, locally payable course marketplace built for the Ghanaian context?

### 2.1 Conceptual Review

Before comparing systems, the key terms need pinning down. Several of them get used loosely in everyday speech, and that looseness causes trouble in design work.

#### 2.1.1 E-Learning

E-learning is the use of electronic and internet technologies to deliver teaching, learning, and assessment. Clark and Mayer (2016) describe it as instruction delivered on a digital device that is intended to support learning, a definition broad enough to cover a recorded video lecture and a self-grading quiz alike. Rosenberg (2001) framed it earlier and more strategically, as the use of internet technologies to deliver solutions that enhance knowledge and performance. The two definitions point in the same direction but stress different things: one the medium, the other the outcome. Both matter here. The proposed platform is a delivery medium, but its reason for existing is the outcome, getting useful skills to learners who would otherwise struggle to reach them.

E-learning is not one thing. It ranges from fully self-paced content with no live contact to blended models that mix online and face-to-face teaching. Means, Toyama, Murphy, and Baki (2013), in a widely cited meta-analysis, found that students in online conditions performed modestly better on average than those in face-to-face conditions, with blended learning showing the strongest advantage. The finding is often quoted as proof that online learning works, but the authors were careful: the advantage came largely from extra learning time and materials, not from the medium itself. So the lesson for a platform builder is not that putting content online improves learning. It is that online delivery removes friction so learners can spend more time on task. A marketplace that adds friction, through clumsy payment or untrustworthy content, throws that advantage away.

#### 2.1.2 Learning Management System versus Course Marketplace

A learning management system (LMS) is software that administers, documents, and delivers courses, usually for a single institution and its enrolled members. Moodle is the standard example. A course marketplace is a different animal. It is an open platform where independent instructors publish courses and learners from anywhere buy them, with the platform acting as broker and taking a commission (Kaplan & Haenlein, 2016). Udemy is the textbook case.

The distinction is not hair-splitting. It changes the whole design. An LMS assumes a closed, trusted population: the institution vouches for both teachers and students. A marketplace assumes the opposite, an open population of strangers, where trust has to be manufactured by the platform through verification, content review, ratings, and secure payment. The proposed system is a marketplace, not an LMS, and that single fact drives most of its security and governance requirements. And so what? Features that an LMS can take for granted, such as the legitimacy of an instructor, become things the platform must actively police.

#### 2.1.3 Role-Based Access Control

Role-based access control (RBAC) is a model in which permissions are attached to roles, and users are granted roles rather than individual permissions (Sandhu, Coyne, Feinstein, & Youman, 1996). A student role can enroll and learn; an instructor role can create courses; an administrator role can approve, suspend, and refund. The strength of RBAC is that it keeps authorisation simple to reason about and easy to audit, which is why it has stayed the dominant access model in web applications for nearly three decades. The proposed system uses RBAC as its security backbone, and Section 2.4 returns to why.

#### 2.1.4 Online Payment and Revenue Sharing

For a marketplace, payment is not a side feature; it is the business model. A payment gateway is the service that authorises and processes a transaction between a buyer and the platform; gateways built for African markets, such as Paystack, support both cards and mobile money (Paystack, 2023). Revenue sharing is the arrangement by which the platform splits each sale with the instructor, usually as a percentage. The fairness and transparency of that split, and whether the buyer trusts that the money will reach the instructor, strongly affect whether instructors stay on a platform (Sun et al., 2008). A split that is recorded, visible, and applied automatically is therefore not just an accounting convenience; it is a trust mechanism.

### 2.2 Review of Related Technologies

The choices a builder makes about technology constrain what the finished system can do, so the relevant tools deserve a critical look rather than a shopping list.

On the front end, modern course platforms are overwhelmingly built as web applications using JavaScript frameworks, with React the most widely adopted library for building user interfaces (Stack Overflow, 2023). React alone, though, leaves routing, server rendering, and data fetching unanswered, which is why full-stack frameworks built on top of it have become popular. Next.js is the leading one, combining server-side rendering, server actions, and API routes in a single framework, which lets a small team build both the interface and the backend logic without stitching together separate systems. The trade-off, and there is always one, is that tying the front and back ends to one framework reduces flexibility if either needs swapping later. For a focused project with a small team, the productivity gain outweighs that risk.

For data, the long-running debate is relational versus non-relational storage. A marketplace has highly relational data: users own courses, courses contain modules, modules contain lessons, payments link users to courses. Relational databases such as PostgreSQL enforce these relationships and support transactions, which matter enormously when money is involved, because a transaction guarantees that a payment and the enrollment it pays for either both succeed or both fail (Date, 2003). A non-relational store would trade that guarantee for scaling flexibility the project does not need. The literature on transactional systems is fairly settled: where correctness of money beats raw scale, relational and transactional storage wins.

Sitting between the application and the database, an object-relational mapper (ORM) translates database rows into typed objects the code can work with safely. The benefit is fewer hand-written queries and fewer of the injection mistakes that plague raw SQL; the cost is a layer of abstraction that can hide performance problems. Used carefully, the safety gain is the bigger effect, especially for a security-sensitive application.

Authentication is its own area. Storing passwords in plain text is indefensible, and even simple hashing is not enough because fast hashes can be brute-forced. The accepted practice is a slow, salted hashing function such as bcrypt, which is deliberately expensive to compute and so resists brute-force attacks (Provos & Mazières, 1999). For sign-in, token-based sessions and OAuth providers (for example, signing in with a Google account) cut the number of passwords a user must manage. Libraries package these patterns so that small teams do not have to reinvent, and frequently misimplement, authentication from scratch.

### 2.3 Review of Existing Systems

This section examines four representative systems. The point is not to praise or bury them but to see what each does well, where each falls short for the problem at hand, and what the proposed system should borrow or avoid.

#### 2.3.1 Udemy

Udemy is the largest open course marketplace, with a model in which any instructor can publish a course and earn a share of sales. Its strengths are obvious: an enormous catalogue, a working revenue-share system, ratings and reviews that help buyers judge quality, and a polished interface. But its weaknesses matter here. Quality control is light; because almost anyone can publish, the catalogue is uneven, and review tends to be reactive. More to the point for Ghana, payment runs through international card networks, which does not sit well with learners who rely on mobile money (Tagoe, 2012). Udemy shows that the marketplace model works at scale, but also that an open marketplace without strong front-end governance and local payment leaves real users behind.

#### 2.3.2 Coursera

Coursera partners with universities and companies to deliver courses, certificates, and degrees. Its content is more tightly vetted than Udemy's because it comes from named institutions, and its production quality is high. The flip side is that Coursera is not really an open marketplace; an independent expert cannot simply publish a course there. Its pricing, often subscription-based and quoted in foreign currency, again assumes payment instruments that many target users do not have. Coursera demonstrates the value of vetted content, which the proposed approval workflow borrows, while also showing that heavy curation closes the door to the independent instructors a marketplace is supposed to empower.

#### 2.3.3 Moodle

Moodle is the most widely deployed open-source LMS in the world, used by schools and universities to run their own courses. Its strengths are flexibility, a large plugin ecosystem, and the fact that an institution can host it for free and control its own data. Asunka (2008), studying online learning in sub-Saharan Africa, found that institutional control and offline-friendly design helped adoption under poor connectivity. But Moodle is built for the closed-institution model. It has no native concept of an open marketplace, no built-in instructor payouts, and no revenue sharing, because it was never meant to sell courses to strangers. Adapting it into a marketplace means bolting on payment, vetting, and payout systems it does not have, arguably more work than building a focused marketplace from scratch. Moodle confirms that open-source, self-hosted software is viable in the local context, while showing why an LMS is the wrong starting point for a marketplace.

#### 2.3.4 Local and Regional Platforms

Several locally focused platforms have appeared across the region, and a number of student projects have built smaller e-learning systems. The recurring pattern in the literature is that these systems often nail the basic content-delivery features but skimp on the harder, less visible parts: many lack proper role separation, store credentials weakly, omit rate limiting and audit trails, and either avoid payment entirely or handle it manually (Almaiah et al., 2020). The result is systems that demonstrate well but would not survive contact with real money or a determined attacker. This is the most direct lesson for the present project: the differentiator is not another content player but the security, governance, and payment machinery that smaller systems tend to skip.

In short, Udemy gives the marketplace model and the local-payment gap; Coursera gives the value of vetting and the cost of over-curation; Moodle gives local feasibility and the LMS-versus-marketplace mismatch; and local efforts expose the security gap. The proposed design is, in effect, an attempt to keep these strengths while closing the gaps.

### 2.4 Review of Methods, Algorithms, and Models

Beyond systems and tools, several established models inform the design and deserve critical treatment.

#### 2.4.1 The Technology Acceptance Model

The Technology Acceptance Model (TAM), introduced by Davis (1989), holds that two beliefs, perceived usefulness and perceived ease of use, largely determine whether people adopt a technology. E-learning research has used it heavily. Sun et al. (2008) extended the idea and found that learner satisfaction, and ultimately continued use, depended on perceived ease of use, content quality, and, importantly, the reliability and security of the system. Almaiah et al. (2020) reinforced this during the pandemic, reporting that trust and security concerns were among the strongest factors in whether learners kept using a platform.

TAM is not above criticism. It has been argued that the model is too parsimonious, treating usefulness and ease of use as the whole story while underplaying social, cultural, and infrastructural factors such as connectivity and cost, which are precisely the factors that bite hardest in the Ghanaian setting (Tagoe, 2012). The sensible reading is to take TAM as a starting frame rather than gospel: design for ease of use and obvious usefulness, yes, but treat security, payment accessibility, and reliability as first-class concerns rather than afterthoughts. The proposed emphasis on a clean interface, local payment, and visible trust signals follows directly from this.

#### 2.4.2 Role-Based Access Control as a Security Model

The RBAC model of Sandhu et al. (1996) remains the practical standard for authorisation in multi-user systems. Its core claim is that managing permissions through a small set of roles is both more secure and more maintainable than granting permissions to users one by one, because it shrinks the number of things that can go wrong and makes the security policy legible. Critics note that pure RBAC struggles with very fine-grained or context-dependent permissions, which is true; but for a system with three well-separated roles and a handful of sensitive operations, RBAC is an excellent fit. A small amount of extra checking, such as confirming that an instructor owns the course they are editing, can cover the fine-grained cases RBAC alone does not.

#### 2.4.3 Automated Assessment and Auto-Grading

Automated assessment grades learner responses without a human marker. For objective question types, multiple-choice and true/false, auto-grading is straightforward and reliable: the system compares the submitted answer against a stored key and computes a score. The educational literature supports objective testing as a valid measure of knowledge recall and, when questions are well written, of understanding, while cautioning that it cannot easily assess open-ended skills (Nicol & Macfarlane-Dick, 2006). The same authors stress that prompt feedback is one of the strongest drivers of learning, an argument in favour of auto-grading, since it returns a result instantly. The design implication is twofold: lean on auto-graded objective questions for scalable assessment, but guard their integrity with timing and submission controls, because objective tests are easy to game otherwise.

#### 2.4.4 Software Development Methodology

On the process side, the choice is usually framed as plan-driven (Waterfall) versus iterative and incremental (Agile and its relatives). Waterfall assumes requirements are known and stable up front; Agile assumes they will be discovered and refined as the system takes shape (Beck et al., 2001). For a solo, time-boxed project where features are built, tested, and revised in cycles, an iterative approach fits the reality of the work far better than a rigid one. The full justification is given in Chapter Three, but the literature is clear that for small teams building evolving software, incremental delivery reduces risk by surfacing problems early.

### 2.5 Gaps in Existing Systems

Pulling the threads together, the review exposes a consistent set of gaps.

First, a **local payment gap**. The dominant marketplaces assume payment instruments, mainly international cards, that a large share of Ghanaian learners do not use, while the self-hosted LMS option has no built-in payment at all (Tagoe, 2012; Asunka, 2008). Neither end of the spectrum serves a learner who wants to pay with mobile money.

Second, a **governance gap**. Open marketplaces police content reactively, and locally built systems frequently lack any enforced review step or clean role separation (Almaiah et al., 2020). There is a missing middle: a marketplace that stays open to independent instructors yet still puts a human approval gate in front of paying students.

Third, a **security and transparency gap**. The harder, invisible safeguards, salted password hashing, rate limiting, idempotent payment handling, automatic and recorded revenue splitting, and audit trails, are exactly the parts that smaller systems tend to omit, even though the acceptance literature says trust and security are decisive for continued use (Sun et al., 2008; Almaiah et al., 2020).

Fourth, and underlying the others, a **contextual gap**: comparatively little applied work documents how to assemble all of the above into one coherent, low-cost system built specifically for a setting like Ghana, using current free and open tooling. The studies that flag the demand rarely show the build.

### 2.6 Summary of the Literature Review

The literature draws a fairly clear picture. Online learning works, but mostly because it removes friction and adds learning time, which means a platform that adds friction defeats its own purpose. A course marketplace is a distinct kind of system from a learning management system, and being open to strangers forces it to manufacture trust through verification, vetting, secure payment, and transparent money handling. The acceptance research keeps returning to the same point: ease of use gets people in the door, but reliability, security, and trust decide whether they stay, and in the Ghanaian context, payment accessibility and connectivity sharpen that point further.

Put the existing systems side by side, and each one solves a piece of the problem while leaving a piece open. Udemy proves the marketplace model but misses local payment and strong vetting. Coursera proves the value of vetting but shuts out independent instructors. Moodle proves local, self-hosted feasibility but is the wrong shape for a marketplace. Smaller local efforts deliver content but skip the security and payment machinery that real money demands. The gaps that survive this comparison, local payment, enforced governance, real security and transparency, and the lack of a documented low-cost build for the local context, are precisely the gaps the present project sets out to close. The chapter that follows describes how the proposed system is designed to do so.

---

## REFERENCES

Almaiah, M. A., Al-Khasawneh, A., & Althunibat, A. (2020). Exploring the critical challenges and factors influencing the E-learning system usage during COVID-19 pandemic. *Education and Information Technologies, 25*(6), 5261–5280. https://doi.org/10.1007/s10639-020-10219-y

Asunka, S. (2008). Online learning in higher education in Sub-Saharan Africa: Ghanaian university students' experiences and perceptions. *The International Review of Research in Open and Distributed Learning, 9*(3), 1–23. https://doi.org/10.19173/irrodl.v9i3.586

Beck, K., Beedle, M., van Bennekum, A., Cockburn, A., Cunningham, W., Fowler, M., … Thomas, D. (2001). *Manifesto for agile software development*. https://agilemanifesto.org

Clark, R. C., & Mayer, R. E. (2016). *e-Learning and the science of instruction: Proven guidelines for consumers and designers of multimedia learning* (4th ed.). Wiley.

Date, C. J. (2003). *An introduction to database systems* (8th ed.). Addison-Wesley.

Davis, F. D. (1989). Perceived usefulness, perceived ease of use, and user acceptance of information technology. *MIS Quarterly, 13*(3), 319–340. https://doi.org/10.2307/249008

Kaplan, A. M., & Haenlein, M. (2016). Higher education and the digital revolution: About MOOCs, SPOCs, social media, and the Cookie Monster. *Business Horizons, 59*(4), 441–450. https://doi.org/10.1016/j.bushor.2016.03.008

Means, B., Toyama, Y., Murphy, R., & Baki, M. (2013). The effectiveness of online and blended learning: A meta-analysis of the empirical literature. *Teachers College Record, 115*(3), 1–47. https://doi.org/10.1177/016146811311500307

Nicol, D. J., & Macfarlane-Dick, D. (2006). Formative assessment and self-regulated learning: A model and seven principles of good feedback practice. *Studies in Higher Education, 31*(2), 199–218. https://doi.org/10.1080/03075070600572090

Paystack. (2023). *Paystack documentation*. https://paystack.com/docs

Provos, N., & Mazières, D. (1999). A future-adaptable password scheme. In *Proceedings of the 1999 USENIX Annual Technical Conference* (pp. 81–91). USENIX Association.

Rosenberg, M. J. (2001). *E-learning: Strategies for delivering knowledge in the digital age*. McGraw-Hill.

Sandhu, R. S., Coyne, E. J., Feinstein, H. L., & Youman, C. E. (1996). Role-based access control models. *Computer, 29*(2), 38–47. https://doi.org/10.1109/2.485845

Stack Overflow. (2023). *Stack Overflow developer survey 2023*. https://survey.stackoverflow.co/2023

Sun, P.-C., Tsai, R. J., Finger, G., Chen, Y.-Y., & Yeh, D. (2008). What drives a successful e-Learning? An empirical investigation of the critical factors influencing learner satisfaction. *Computers & Education, 50*(4), 1183–1202. https://doi.org/10.1016/j.compedu.2006.11.007

Tagoe, M. (2012). Students' perceptions on incorporating e-learning into teaching and learning at the University of Ghana. *International Journal of Education and Development using ICT, 8*(1), 91–103.
