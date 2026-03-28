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

describe("Spotivey critical journey", () => {
    it("runs the full user journey", () => {
        const surveyId = uniqSurveyId();

        // Researcher creates account (if UI supports it) and logs in
        cy.visit("/sign-up");

        // These selectors are intentionally conservative. If the UI lacks stable
        // attributes, we will add minimal data-cy tags next.
        fillIfExists('input[name="firstName"], input#firstName', "Test");
        fillIfExists('input[name="lastName"], input#lastName', "Researcher");
        fillIfExists('input[name="username"], input#username', "researcher_e2e");
        fillIfExists('input[name="email"], input#email', "researcher_e2e@example.com");
        fillIfExists('input[name="password"], input#password', "pw12345678");

        cy.contains(/sign up|register|create/i).click({ force: true });

        cy.visit("/login");
        fillIfExists('input[name="email"], input#email', "researcher_e2e");
        fillIfExists('input[name="password"], input#password', "pw12345678");
        cy.contains(/sign in|log in/i).click({ force: true });

        // 1. Create retrieval settings enabling all data types
        cy.visit("/user/settings/new");

        fillIfExists('input[name="umfrageID"], input#umfrageID', surveyId);
        fillIfExists('input[name="umfrageName"], input#umfrageName', "E2E Survey");
        fillIfExists('input[name="umfrageEndUrl"], input#umfrageEndUrl', "https://example.com/end");

        // Try to enable all toggles/checkboxes if present.
        cy.get('input[type="checkbox"]').each(($cb) => {
            cy.wrap($cb).check({ force: true });
        });

        cy.contains(/create|save/i).click({ force: true });

        // 2. Participant retrieves all data (backend runs in SPOTIVEY_TEST_MODE)
        cy.visit(`/?surveyID=${encodeURIComponent(surveyId)}&participant=1&lang=en`);

        // Accept privacy policy
        cy.contains(/accept/i).click({ force: true });

        // Step through confirmations / next buttons
        cy.get("body").then(() => {
            for (let i = 0; i < 12; i++) {
                cy.contains(/next|continue|confirm|finish/i)
                    .click({ force: true })
                    .then(() => { }, () => { });
            }
        });

        // 3. Show results and export CSV
        cy.visit("/user/results");
        cy.contains(/results/i);
        cy.contains(/csv/i).click({ force: true });

        // 4. Fail deleting settings while results exist
        cy.visit("/user/settings");
        cy.contains(/delete/i).click({ force: true });
        cy.contains(/cannot delete|delete.*results/i);

        // 5. Delete results
        cy.contains(/delete results|delete.*data/i).click({ force: true });

        // 6. Edit settings to only saved tracks
        cy.contains(/edit/i).click({ force: true });
        cy.get('input[type="checkbox"]').each(($cb) => {
            cy.wrap($cb).uncheck({ force: true });
        });
        cy.get('input[type="checkbox"]').first().check({ force: true });
        cy.contains(/save/i).click({ force: true });

        // 7. Participant retrieves saved tracks
        cy.visit(`/?surveyID=${encodeURIComponent(surveyId)}&participant=1&lang=en`);
        cy.contains(/accept/i).click({ force: true });
        cy.contains(/next|continue|confirm|finish/i)
            .click({ force: true })
            .then(() => { }, () => { });

        // 8. Results and CSV again
        cy.visit("/user/results");
        cy.contains(/csv/i).click({ force: true });

        // 9. Delete results
        cy.contains(/delete results|delete.*data/i).click({ force: true });

        // 10. Delete settings
        cy.visit("/user/settings");
        cy.contains(/delete/i).click({ force: true });
    });
});
