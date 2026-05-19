import * as React from "react";
import { TextField } from "@mui/material";

function clampNumber(value, min, max) {
    if (Number.isNaN(value)) return min;
    return Math.min(max, Math.max(min, value));
}

export function BoundedNumberField({
    label,
    value,
    onChange,
    min,
    max,
    step = 1,
    integer = true,
    ...textFieldProps
}) {
    const [text, setText] = React.useState(String(value ?? ""));

    React.useEffect(() => {
        setText(String(value ?? ""));
    }, [value]);

    const parse = (raw) => {
        const n = Number(raw);
        if (Number.isNaN(n)) return NaN;
        return integer ? Math.trunc(n) : n;
    };

    const commit = () => {
        const next = clampNumber(parse(text), min, max);
        onChange(next);
        setText(String(next));
    };

    return (
        <TextField
            {...textFieldProps}
            label={label}
            type="number"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={commit}
            inputProps={{ min, max, step }}
            helperText={`Range: ${min}–${max}`}
        />
    );
}