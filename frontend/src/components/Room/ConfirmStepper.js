import React, { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Step from "@mui/material/Step";
import StepButton from "@mui/material/StepButton";
import Stepper from "@mui/material/Stepper";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export default function ConfirmStepper({
    steps,
    language,
    confirmTextArray,
    renderStepContent,
    onFinish,
}) {
    const [activeStep, setActiveStep] = useState(0);
    const [completed, setCompleted] = useState({});

    const currentStep = steps[activeStep];
    const currentConfirmText = confirmTextArray?.[currentStep?.index];

    const allCompleted = useMemo(
        () => Object.keys(completed).length === steps.length,
        [completed, steps.length]
    );

    function handleStep(step) {
        return () => setActiveStep(step);
    }

    function handleNext() {
        const isLastStep = activeStep === steps.length - 1;
        const isNotAllCompleted = Object.keys(completed).length !== steps.length;

        if (isLastStep && isNotAllCompleted) {
            const firstIncomplete = steps.findIndex((_, i) => !(i in completed));
            setActiveStep(firstIncomplete);
            return;
        }

        setActiveStep((prev) => prev + 1);
    }

    function handleCompleteCurrent() {
        setCompleted((prev) => ({ ...prev, [activeStep]: true }));
    }

    async function handlePrimaryClick() {
        const nextCompleted = { ...completed, [activeStep]: true };
        setCompleted(nextCompleted);

        const isAllCompleted = Object.keys(nextCompleted).length === steps.length;
        if (isAllCompleted) {
            await onFinish();
            return;
        }

        handleNext();
    }

    if (steps.length === 0) {
        return null;
    }

    return (
        <React.Fragment>
            {!allCompleted && (
                <React.Fragment>
                    <div style={{ padding: "60px 0 0" }}>
                        <div className="render-result-explanation-container">
                            <div className="render-result-explanation-inner">
                                <body1 className="render-result-explanation">
                                    {language === "en"
                                        ? currentConfirmText?.[0]
                                        : currentConfirmText?.[1]}
                                </body1>
                            </div>
                        </div>
                    </div>

                    <Stepper activeStep={activeStep}>
                        {steps.map((step, index) => (
                            <Step key={step.label} completed={completed[index]}>
                                <StepButton color="inherit" onClick={handleStep(index)}>
                                    {step.label}
                                </StepButton>
                            </Step>
                        ))}
                    </Stepper>

                    <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
                        <Box sx={{ flex: "1 1 auto" }} />
                        <Button onClick={handlePrimaryClick} variant="contained">
                            {activeStep !== steps.length - 1 ? <ArrowForwardIcon /> : "OK"}
                        </Button>
                    </Box>
                </React.Fragment>
            )}

            {!allCompleted && renderStepContent(steps[activeStep])}
        </React.Fragment>
    );
}
