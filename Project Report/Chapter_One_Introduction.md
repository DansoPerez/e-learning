# CHAPTER ONE

## INTRODUCTION

This chapter sets the scene for the project. It opens with the background that motivated the work, then narrows down to the specific problem the proposed system is meant to solve. After that it lays out the aim and objectives, the questions the study seeks to answer, why the work matters, and where its boundaries are drawn. The chapter closes with the limitations that shape the project and a short map of how the rest of the report is arranged.

### 1.1 Background of the Study

Education no longer lives only inside a classroom. Over the last two decades, learning has moved onto screens, and the people who teach and the people who learn now meet through software as often as they meet in person. This shift has a name most people already use without thinking about it: e-learning. At its simplest, e-learning is the delivery of teaching and learning through electronic and internet technologies, where course material, assessment, and interaction happen online rather than face to face (Clark & Mayer, 2016).

Why does this matter? Because access to good teaching has always been uneven. A learner in a small town and a learner in a capital city rarely get the same teachers or the same materials. Online platforms chip away at that gap. They let one instructor reach thousands of students at once, and they let a student pick up a skill at midnight if that is the only free hour in the day. The COVID-19 pandemic pushed the point home with some force. When schools shut their doors in 2020, institutions with online options kept teaching, and the ones without them scrambled (Almaiah, Al-Khasawneh, & Althunibat, 2020).

A second thing changed alongside the technology. Teaching became something a person could sell directly, without a school standing in the middle. Platforms such as Udemy and Coursera turned course content into a product on a marketplace, where independent instructors publish what they know, set a price, and earn a share of every sale (Kaplan & Haenlein, 2016). This is a different model from the old learning management system, which mostly served a single institution and its registered students. A marketplace is open. Anyone with expertise can sell, and anyone with interest can buy. That openness is the source of both its power and its risks.

Ghana sits squarely inside this story. Internet penetration and mobile money have grown fast, and a young population is hungry for marketable skills that the formal system does not always supply. Studies of higher education in the country and the wider sub-Saharan region have repeatedly flagged the appetite for online learning, while also noting real obstacles: patchy connectivity, the cost of data, and platforms that were never designed with local payment habits in mind (Asunka, 2008; Tagoe, 2012). Most popular global platforms collect payment through international card networks, which many Ghanaian learners do not have or do not like using. So a gap opens between the platforms that exist and the people who want to use them.

There is a quieter problem too, and it has to do with trust. A marketplace only works if everyone in it behaves. Instructors must be who they claim to be. Course content should be reviewed before it reaches a paying student. Money taken from a buyer must reach the right seller, and the platform's cut must be calculated correctly and recorded somewhere it can be checked later. When any of these breaks down, the whole thing falls apart, because nobody pays for a service they cannot trust. Researchers who study why some e-learning systems succeed and others die have found again and again that perceived security and clear governance sit near the top of the list (Sun, Tsai, Finger, Chen, & Yeh, 2008; Davis, 1989). A pretty interface is not enough.

It is against this background that the present study proposes the design and implementation of a secure, web-based e-learning marketplace. The proposed platform is intended to bring students, instructors, and administrators together in one place, supporting structured courses made of modules and lessons, quizzes that grade themselves, free and paid enrollment, and a controlled flow of money between buyers, instructors, and the platform. The work is undertaken as an undergraduate project in the Computer Science Department of Kumasi Technical University, and it sets out to answer a practical question: can a small team build an online course marketplace that is genuinely secure, locally payable, and properly governed, using tools that are free and modern?

### 1.2 Problem Statement

Existing e-learning marketplaces do not adequately combine local payment support, role-based content governance, and strong account security in a single accessible platform for the Ghanaian context.

That is the problem in one sentence. The rest of this section explains it.

Look closely at the platforms students actually reach for, and a few cracks show up. First, payment. The big international marketplaces lean on card networks that many Ghanaian learners cannot use comfortably, which quietly locks out a chunk of the people who most want to learn (Tagoe, 2012). Local payment rails handle mobile money and local cards well, but the global platforms have little reason to integrate them.

Second, governance. On a fully open marketplace, anyone can publish anything, and moderation tends to happen after the damage is done rather than before. There is often no enforced review step where a human approves a course before students can pay for it, and no clean separation between what a student may do, what an instructor may do, and what an administrator may do. When roles blur, mistakes and abuse follow.

Third, security and money handling. A marketplace moves real cash. If passwords are stored carelessly, if login attempts are not throttled, if a payment can be confirmed twice and pay an instructor twice, or if there is no audit trail of who did what and when, the platform becomes a liability instead of a service. Smaller and locally built systems frequently skip these controls because they are tedious to implement, and the result is a system that works in a demo but cannot be trusted with anyone's money (Almaiah et al., 2020).

These three weaknesses feed each other. A platform that cannot take local payment will not attract local instructors; without trustworthy instructors and reviewed content, students will not pay; and without security and an audit trail, neither group has reason to believe the platform will treat them fairly. The gap, then, is the absence of one coherent system that closes all three at once and is still light enough for a small team to build and run. This gap has to be filled because the demand for affordable, skill-focused online learning in Ghana is real and growing, and the tools to serve it are now within reach of an undergraduate project.

### 1.3 Aim and Objectives

#### 1.3.1 Aim

The aim of the study is to design and implement a secure, web-based e-learning marketplace that supports role-based course management, local online payment, automated assessment, and transparent revenue sharing.

#### 1.3.2 Specific Objectives

To achieve this aim, the project pursues the following objectives:

1. To design a role-based access control model that cleanly separates the privileges of students, instructors, and administrators.
2. To develop a course management and approval workflow that lets instructors build modular courses while requiring administrative review before publication.
3. To implement secure authentication and account protection, including hashed passwords, optional email verification, rate limiting, and an audit trail of sensitive actions.
4. To integrate a local online payment channel that enables free and paid enrollment and automatically splits revenue between instructors and the platform.
5. To build an automated assessment module that delivers timed quizzes, grades attempts without human input, and tracks learner progress.
6. To evaluate the implemented system against its functional and security requirements through unit, integration, and user testing.

### 1.4 Research Questions

The study is guided by the following questions:

1. How can the privileges of students, instructors, and administrators be modelled so that access is correct and abuse is hard?
2. What workflow allows instructors freedom to create courses while keeping unreviewed content away from paying students?
3. Which security controls are practical for a small team to implement, and do they hold up under testing?
4. Can a local payment channel be integrated to support enrollment and automatic revenue sharing without manual reconciliation?
5. Does an automated quiz and progress-tracking module produce reliable results compared with manual grading?

### 1.5 Significance of the Study

This work has value for several groups.

For **students**, especially those in Ghana and similar settings, the proposed platform lowers two barriers at once: the payment barrier, by accepting local payment methods, and the trust barrier, by serving only courses that have passed administrative review. A learner can spend money with less worry and reach material that has been checked.

For **instructors**, the system offers a way to turn knowledge into income without owning a website or a payment processor. A clear revenue split, an earnings record, and a withdrawal workflow give them a transparent, recorded relationship with the platform, so they always know what they have earned and why.

For the **academic field**, the project is a worked example of how a secure multi-role marketplace can be assembled from free, modern, open tools. Its design decisions, particularly around the approval workflow, the payment-to-enrollment flow, and the audit trail, can be reused or critiqued by other students and developers building similar systems.

For **institutions and policymakers**, the work shows that a locally hosted, locally payable learning marketplace is feasible on a modest budget, a useful data point for any conversation about widening access to digital skills training in the country.

### 1.6 Scope of the Study

The project covers the design and implementation of a working web-based e-learning marketplace with three user roles: student, instructor, and administrator. Within that boundary, the system handles user registration and authentication, instructor application and approval, course creation with modules and lessons, an administrative course-approval workflow, free and paid enrollment, automated quizzes with attempt history, progress tracking, reviews, in-app messaging, notifications, withdrawals with a configurable commission, and an audit log of sensitive actions.

The platform is built as a web application using modern JavaScript tooling and a relational database, with a local payment gateway as the payment channel. Development and testing run over the course of one academic year.

Some things are deliberately left out. The project does not build native mobile applications; the platform is web-based, though it works in a mobile browser. It does not implement live video lectures, real-time virtual classrooms, or AI-driven features such as automatic content generation or recommendation. Course videos are embedded from external hosts rather than streamed from the platform's own infrastructure, and the payment integration is exercised in a test environment rather than at production scale. These exclusions keep the work focused on the core problem of a secure, governable, locally payable marketplace.

### 1.7 Limitations of the Study

A few constraints shape what the project can achieve. Time is the main one. As a single academic-year undertaking carried out by a student, the work has to be scoped to a deliverable system rather than an exhaustive one, which is partly why advanced features such as live classes and recommendation engines are set aside.

Cost is a second constraint. To keep the project free to build and run, it relies on free tiers of hosting and database services and on the test mode of the payment provider. This means performance is not measured under heavy production load, and behaviour at very large numbers of concurrent users is estimated rather than observed.

Connectivity and access also limit user testing. Recruiting a large, varied pool of testers under real network conditions across the country is not feasible, so evaluation draws on a smaller group of testers using demo accounts. The findings should be read with that sample size in mind.

### 1.8 Organisation of the Report

The report is organised into five chapters.

The first chapter focuses on the background of the study, the problem statement, the aim and objectives, the research questions, the significance of the work, its scope, and its limitations. It also describes how the report is organised.

The second chapter reviews what other researchers and developers have done around online learning and course marketplaces. It defines the key concepts, looks at existing systems and the technologies behind them, examines the methods and models that inform the design, and pins down the gaps the project sets out to fill.

The third chapter turns to the proposed system design. It explains the software development methodology and why it was chosen, sets out the functional and non-functional requirements, and presents the system architecture together with the supporting diagrams, the database design, and the user interaction flows.

The fourth chapter covers system implementation and testing. It walks through how the design is turned into a working application, shows the interfaces, explains the major code modules, and reports the test plan, the test cases, and the results.

The fifth chapter discusses what the results mean. It summarises the findings, states whether the objectives were met, compares the system with what already exists, notes the challenges met along the way, and points to work that could be done in future.
