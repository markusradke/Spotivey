import React, { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Step from "@mui/material/Step";
import StepButton from "@mui/material/StepButton";
import Stepper from "@mui/material/Stepper";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export default function ConfirmStepper({
    steps,
    language,
    confirmTextArray,
    renderStepContent,
    onFinish,
    onToggleAllCurrentStep,
}) {
    const [activeStep, setActiveStep] = useState(0);
    const [completed, setCompleted] = useState({});
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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

    async function handleConfirmAllResults() {
        const nextCompleted = {};
        steps.forEach((_, i) => {
            nextCompleted[i] = true;
        });

        setCompleted(nextCompleted);
        await onFinish();
    }

    if (steps.length === 0) {
        return null;
    }

    return (
        <React.Fragment>
            {!allCompleted && (
                <Box sx={{ pt: { xs: 2, sm: 4, md: 7.5 }, px: { xs: 1, sm: 0 } }}>
                    <Paper
                        elevation={2}
                        sx={{
                            mx: "auto",
                            maxWidth: 900,
                            px: { xs: 2, sm: 3, md: 4 },
                            py: { xs: 2.5, sm: 3.5, md: 4 },
                            backgroundColor: "var(--main-bg-color)",
                            borderRadius: { xs: 3, sm: 4 },
                        }}
                    >
                        <Stack spacing={2.5}>
                            <Box sx={{ textAlign: "center" }}>
                                <Typography
                                    variant={isMobile ? "h6" : "h5"}
                                    component="h2"
                                    sx={{ color: "var(--color-black)", fontWeight: 700 }}
                                >
                                    {language === "en"
                                        ? "Check your selections"
                                        : "Prüfe deine Auswahl"}
                                </Typography>

                                <Typography
                                    variant="body1"
                                    className="render-result-explanation"
                                    sx={{ mt: 1, color: "var(--color-black)" }}
                                >
                                    {language === "en"
                                        ? currentConfirmText?.[0]
                                        : currentConfirmText?.[1]}
                                </Typography>
                            </Box>

                            <Box sx={{ display: "flex", justifyContent: "center" }}>
                                <Button
                                    onClick={handleConfirmAllResults}
                                    variant="contained"
                                    color="error"
                                    fullWidth={isMobile}
                                    sx={{ maxWidth: { xs: "100%", sm: 340 } }}
                                >
                                    {language === "en"
                                        ? "Confirm all results"
                                        : "Bestätige alle Ergebnisse"}
                                </Button>
                            </Box>

                            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                                <Button
                                    onClick={handlePrimaryClick}
                                    variant="contained"
                                    fullWidth={isMobile}
                                    sx={{ minWidth: { sm: 120 } }}
                                >
                                    {activeStep !== steps.length - 1 ? <ArrowForwardIcon /> : "OK"}
                                </Button>
                            </Box>

                            <Stepper
                                activeStep={activeStep}
                                orientation={isMobile ? "vertical" : "horizontal"}
                                alternativeLabel={!isMobile}
                                sx={{ width: "100%" }}
                            >
                                {steps.map((step, index) => (
                                    <Step key={step.label} completed={completed[index]}>
                                        <StepButton
                                            color="inherit"
                                            onClick={handleStep(index)}
                                            sx={{ width: "100%" }}
                                        >
                                            {step.label}
                                        </StepButton>
                                    </Step>
                                ))}
                            </Stepper>

                            {typeof onToggleAllCurrentStep === "function" && (
                                <Stack
                                    direction={isMobile ? "column" : "row"}
                                    spacing={1}
                                    justifyContent="flex-end"
                                >
                                    <Button
                                        size="small"
                                        variant="text"
                                        color="inherit"
                                        fullWidth={isMobile}
                                        sx={{ color: "text.secondary" }}
                                        onClick={() => onToggleAllCurrentStep(currentStep, true)}
                                    >
                                        {language === "en" ? "Select all" : "Alle auswählen"}
                                    </Button>

                                    <Button
                                        size="small"
                                        variant="text"
                                        color="inherit"
                                        fullWidth={isMobile}
                                        sx={{ color: "text.secondary" }}
                                        onClick={() => onToggleAllCurrentStep(currentStep, false)}
                                    >
                                        {language === "en" ? "Deselect all" : "Keine auswählen"}
                                    </Button>
                                </Stack>
                            )}

                            {renderStepContent(steps[activeStep])}

                            <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 1 }}>
                                <Button
                                    onClick={handlePrimaryClick}
                                    variant="contained"
                                    fullWidth={isMobile}
                                    sx={{ minWidth: { sm: 120 } }}
                                >
                                    {activeStep !== steps.length - 1 ? <ArrowForwardIcon /> : "OK"}
                                </Button>
                            </Box>
                        </Stack>
                    </Paper>
                </Box>
            )}
        </React.Fragment>
    );
}
