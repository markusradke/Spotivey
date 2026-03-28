function uniqSurveyId() {
    return String(Date.now());
}

function fillIfExists(selector, value) {
    cy.get("body").then(($body) => {
        if ($body.find(selector).length) {
            cy.get(selector).clear().type(value);
        }
    });
}

function fillMuiTextFieldByLabel(labelText, value) {
    const labelRegex = new RegExp(`^${labelText}$`, "i");

    cy.contains("label", labelRegex)
        .should("be.visible")
        .closest(".MuiFormControl-root")
        .find("input, textarea")
        .first()
        .clear({ force: true })
        .type(value, { force: true })
        .should("have.value", value);
}

function checkAllCheckboxesInActiveSlide() {
    cy.get('.swiper-slide-active .spotify-check input[type="checkbox"]').then(($cbs) => {
        const len = $cbs.length;
        Cypress._.times(len, (i) => {
            cy.get('.swiper-slide-active .spotify-check input[type="checkbox"]')
                .eq(i)
                .check({ force: true });
        });
    });
}

function uncheckAllCheckboxesInActiveSlide() {
    cy.get('.swiper-slide-active .spotify-check input[type="checkbox"]').then(($cbs) => {
        const len = $cbs.length;
        Cypress._.times(len, (i) => {
            cy.get('.swiper-slide-active .spotify-check input[type="checkbox"]')
                .eq(i)
                .uncheck({ force: true });
        });
    });
}

function completeConfirmStepper(expectedLang) {
    const endRoomPath = `/end-room/${expectedLang}`;

    function waitForStepperOrEndRoom(remainingChecks) {
        cy.location("pathname").then((pathname) => {
            if (pathname.includes(endRoomPath)) {
                return;
            }

            cy.get("body").then(($body) => {
                if ($body.find(".MuiStepper-root").length) {
                    return;
                }

                if (remainingChecks <= 0) {
                    cy.location("pathname").should("include", endRoomPath);
                    return;
                }

                cy.wait(500);
                waitForStepperOrEndRoom(remainingChecks - 1);
            });
        });
    }

    cy.get("body").then(($body) => {
        if ($body.find(".loading-container").length) {
            cy.get(".loading-container", { timeout: 10000 }).should("not.exist");
        }
    });

    waitForStepperOrEndRoom(120);

    cy.location("pathname").then((pathnameAfterWait) => {
        cy.get("body").then(($body) => {
            const hasStepper = $body.find(".MuiStepper-root").length > 0;

            if (!hasStepper) {
                throw new Error(
                    `Expected at least one confirmation step (Stepper), but none appeared. ` +
                    `The app navigated to '${pathnameAfterWait}'. ` +
                    `Ensure at least one data type has confirmation enabled and limit > 0.`
                );
            }

            cy.get(".room-content-main .MuiStepper-root")
                .should("be.visible")
                .find(".MuiStepButton-root")
                .its("length")
                .then((stepCount) => {
                    expect(stepCount).to.be.greaterThan(0);

                    Cypress._.times(stepCount, () => {
                        cy.get(".room-content-main button.MuiButton-contained")
                            .should("be.visible")
                            .click({ force: true });
                        cy.wait(250);
                    });
                });

            cy.location("pathname", { timeout: 10000 }).should(
                "include",
                endRoomPath
            );
        });
    });
}

function selectSurveyResultsAndWaitForButtons(surveyId) {
    cy.contains(
        ".survey-id-check-result-list-container .card-content-survey-id",
        String(surveyId),
        { timeout: 10000 }
    )
        .should("be.visible")
        .closest(".survey-id-check-result-list-container")
        .click({ force: true });

    cy.contains(".button-csv-title", /^export csv-file$/i, { timeout: 10000 })
        .should("be.visible");
    cy.contains("button", /^delete results$/i, { timeout: 10000 }).should(
        "be.visible"
    );
}

function deleteResultsForSurvey(surveyId) {
    selectSurveyResultsAndWaitForButtons(surveyId);
    cy.contains("button", /^delete results$/i)
        .should("be.visible")
        .click({ force: true });
    cy.contains('[role="dialog"] button', /^agree$/i, { timeout: 10000 })
        .should("be.visible")
        .click({ force: true });
    cy.contains(/select a survey id/i, { timeout: 10000 }).should("be.visible");
    cy.contains(
        ".survey-id-check-result-list-container .card-content-survey-id",
        String(surveyId),
        { timeout: 10000 }
    ).should("be.visible");
}

function selectProfileRowInSettingsGrid(surveyId) {
    cy.get(".MuiDataGrid-root", { timeout: 10000 }).should("be.visible");
    cy.contains(
        '.MuiDataGrid-root .MuiDataGrid-cell[data-field="umfrageID"]',
        String(surveyId),
        { timeout: 10000 }
    )
        .scrollIntoView()
        .should("be.visible")
        .closest('.MuiDataGrid-row')
        .within(() => {
            cy.get('.MuiDataGrid-cellCheckbox input[type="checkbox"]')
                .should("exist")
                .check({ force: true });
        });
}

function setSpotifyOptionEnabled(optionTitle, enabled) {
    const titleRegex = new RegExp(`^${optionTitle}$`, "i");

    cy.get('.swiper-slide-active')
        .contains('h2.settings-content-item-title', titleRegex)
        .should('exist')
        .scrollIntoView()
        .then(($heading) => {
            cy.wrap($heading)
                .nextAll('.spotify-container')
                .first()
                .should('exist')
                .find('.spotify-check input[type="checkbox"]')
                .then(($cb) => {
                    const isChecked = $cb.is(':checked');
                    if (enabled && !isChecked) {
                        cy.wrap($cb).check({ force: true });
                    }
                    if (!enabled && isChecked) {
                        cy.wrap($cb).uncheck({ force: true });
                    }
                });
        });
}

function setConfirmNoForOption(optionTitle) {
    const titleRegex = new RegExp(`^${optionTitle}$`, "i");

    cy.get('.swiper-slide-active')
        .contains('h2.settings-content-item-title', titleRegex)
        .should('exist')
        .scrollIntoView()
        .then(($heading) => {
            cy.wrap($heading)
                .nextAll('.spotify-container')
                .first()
                .should('exist')
                .within(() => {
                    cy.contains('.confirm-container label', /^no$/i)
                        .find('input[type="checkbox"]')
                        .then(($noCb) => {
                            if (!$noCb.is(':checked')) {
                                cy.wrap($noCb).click({ force: true });
                            }
                        });
                });
        });
}

function editSettingsToOnlySavedTracksWithoutConfirmation(surveyId) {
    selectProfileRowInSettingsGrid(surveyId);

    cy.contains('button', /^edit profile$/i)
        .should('be.enabled')
        .click({ force: true });

    cy.location('pathname', { timeout: 60000 }).should(
        'include',
        '/user/settings/new'
    );

    cy.contains('a', /^tracks$/i).click({ force: true });
    cy.get('.swiper-slide-active')
        .contains('h1.settings-title', /^tracks settings$/i)
        .should('exist');
    setSpotifyOptionEnabled("Get User's Saved Tracks", true);
    setConfirmNoForOption("Get User's Saved Tracks");
    setSpotifyOptionEnabled('Get Last Played Tracks', false);

    cy.contains('a', /user's/i).click({ force: true });
    uncheckAllCheckboxesInActiveSlide();

    cy.contains('a', /^playlists$/i).click({ force: true });
    uncheckAllCheckboxesInActiveSlide();

    cy.get('.speicher-button')
        .contains('button', /^update$/i)
        .should('not.be.disabled')
        .click({ force: true });
    cy.contains('[role="dialog"] button', /^okay$/i).click({ force: true });
}

function attemptDeleteProfileExpectBlocked(surveyId) {
    cy.get(".MuiDataGrid-root", { timeout: 10000 }).should("be.visible");

    cy.contains(
        '.MuiDataGrid-root .MuiDataGrid-cell[data-field="umfrageID"]',
        String(surveyId),
        { timeout: 10000 }
    )
        .scrollIntoView()
        .should("be.visible")
        .closest('.MuiDataGrid-row')
        .within(() => {
            cy.get('.MuiDataGrid-cellCheckbox input[type="checkbox"]')
                .should("exist")
                .check({ force: true });
        });

    cy.contains("button", /^delete profile$/i)
        .should("be.enabled")
        .click({ force: true });

    cy.contains("[role=dialog]", /cannot delete settings/i, { timeout: 10000 })
        .should("be.visible");
    cy.contains(
        "[role=dialog]",
        /please delete the results data first/i,
        { timeout: 10000 }
    ).should("be.visible");
}

function deleteProfileExpectSuccess(surveyId) {
    cy.intercept("GET", "/api/get-participant-count*").as("getParticipantCount");
    cy.intercept("GET", "/api/delete-settings*").as("deleteSettings");

    selectProfileRowInSettingsGrid(surveyId);

    cy.contains("button", /^delete profile$/i)
        .should("be.enabled")
        .click({ force: true });

    cy.wait("@getParticipantCount")
        .its("response.statusCode")
        .should("eq", 200);
    cy.wait("@deleteSettings").its("response.statusCode").should("eq", 200);

    cy.get("body", { timeout: 10000 }).should(($body) => {
        const pageText = $body.text();
        expect(pageText).not.to.include(String(surveyId));
        expect(pageText).not.to.match(/cannot delete settings/i);
        expect(pageText).not.to.match(/please delete the results data first/i);
    });
}

describe("Spotivey critical journey", () => {
    let surveyIdForCleanup;

    after(() => {
        if (!surveyIdForCleanup) return;

        const encoded = encodeURIComponent(surveyIdForCleanup);

        cy.request({
            method: "GET",
            url: `/api/delete-only-results?surveyid=${encoded}`,
            failOnStatusCode: false,
        });

        cy.request({
            method: "GET",
            url: `/api/delete-settings?surveyid=${encoded}`,
            failOnStatusCode: false,
        });

        cy.request({
            method: "POST",
            url: "/api/logout-user",
            failOnStatusCode: false,
        });
    });

    it("runs the full user journey", () => {
        const surveyId = uniqSurveyId();
        surveyIdForCleanup = surveyId;
        const runId = surveyId;
        const researcherUsername = `researcher_e2e_${runId}`;
        const researcherEmail = `researcher_e2e_${runId}@example.com`;
        const researcherPassword = "pw12345678";

        // Researcher creates account (if UI supports it) and logs in
        cy.intercept("POST", "/api/create-settings-user").as("createUser");
        cy.visit("/sign-up");
        fillIfExists('input[name="firstName"], input#firstName', "Test");
        fillIfExists('input[name="lastName"], input#lastName', "Researcher");
        fillIfExists('input[name="username"], input#username', researcherUsername);
        fillIfExists('input[name="email"], input#email', researcherEmail);
        fillIfExists('input[name="password"], input#password', researcherPassword);

        cy.contains("button", /^sign up$/i).click({ force: true });
        cy.wait("@createUser").then((interception) => {
            expect(interception.response && interception.response.statusCode).to.eq(201);
        });

        cy.intercept("POST", "/api/login-settings-user").as("login");
        cy.visit("/login");
        fillIfExists('input[name="email"], input#email', researcherUsername);
        fillIfExists('input[name="password"], input#password', researcherPassword);
        cy.contains("button", /^sign in$/i).click({ force: true });
        cy.wait("@login").its("response.statusCode").should("eq", 200);
        cy.getCookie("sessionid").should("exist");
        cy.request("/api/get-user-session")
            .its("body")
            .its("username")
            .should("eq", researcherUsername);

        // 1. Researcher creates new survey with all options enabled
        cy.intercept("POST", "/api/create-settings").as("createSurvey");
        cy.intercept("GET", "/api/get-user-session").as("getUserSessionSettings");
        cy.visit("/user/settings/new");
        cy.wait("@getUserSessionSettings")
            .its("response.body.username")
            .should("eq", researcherUsername);

        // Ensure we're on the Main Settings slide before typing.
        cy.contains('a', /^Main Settings$/i).click({ force: true });
        fillMuiTextFieldByLabel('Name Survey', 'E2E Survey');
        fillMuiTextFieldByLabel('1st Survey ID', surveyId);

        cy.contains('a', /^Tracks$/i).click({ force: true });
        checkAllCheckboxesInActiveSlide();
        cy.contains('a', /User's/i).click({ force: true });
        checkAllCheckboxesInActiveSlide();
        cy.contains('a', /^Playlists$/i).click({ force: true });
        checkAllCheckboxesInActiveSlide();

        cy.get('.speicher-button')
            .contains('button', /^save$/i)
            .should('not.be.disabled')
            .click();

        cy.contains('[role="dialog"] button', /^okay$/i).click();
        cy.wait("@createSurvey").its("response.statusCode").should("eq", 201);

        // 2. Participant retrieves all data (backend runs in SPOTIVEY_TEST_MODE)
        cy.visit(`/?surveyID=${encodeURIComponent(surveyId)}&participant=1&lang=en`);

        // Accept privacy policy
        cy.get('.speicher-button').contains('button', /^ok$/i).click({ force: true });

        // Step through confirmations (MUI Stepper primary button)
        completeConfirmStepper("en");

        // 3. Show results and check CSV export and delete results button exist
        cy.visit("/user/results");
        selectSurveyResultsAndWaitForButtons(surveyId);

        // 4. Fail deleting settings while results exist
        cy.visit("/user/settings");
        attemptDeleteProfileExpectBlocked(surveyId);

        // 5. Delete results
        cy.visit('/user/results');
        deleteResultsForSurvey(surveyId);

        // 6. Edit settings to only saved tracks without confirmation
        cy.visit("/user/settings");
        cy.intercept('POST', '/api/update-settings').as('updateSurvey');
        editSettingsToOnlySavedTracksWithoutConfirmation(surveyId);
        cy.wait('@updateSurvey').its('response.statusCode').should('eq', 200);


        // 7. Participant retrieves saved tracks
        cy.visit(`/?surveyID=${encodeURIComponent(surveyId)}&participant=1&lang=en`);
        cy.wait(1000); // Wait for potential loading states

        // Accept privacy policy 
        // TODO: Should be there always
        // cy.get('.speicher-button').contains('button', /^ok$/i).click({ force: true });


        // 8. Results and CSV / Delete again
        cy.visit("/user/results");
        selectSurveyResultsAndWaitForButtons(surveyId);
        cy.visit('/user/results');
        deleteResultsForSurvey(surveyId);

        // 9. Delete settings
        cy.visit("/user/settings");
        deleteProfileExpectSuccess(surveyId);
    });
});
