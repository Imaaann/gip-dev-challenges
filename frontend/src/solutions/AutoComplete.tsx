import { useMemo, useState } from "react";
import fuzzy from "./FuzzySearch";

function AutoComplete({ data }: { data: string[] }) {
    const [value, setValue] = useState("");
    const [focused, setFocused] = useState(false);
    const suggestions = useMemo(
        () => fuzzy(data, value).slice(0, 5),
        [value, data],
    );

    return (
        <div className="auto-container">
            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
            />
            {focused && value.trim() && (
                <div className="suggest-list">
                    {suggestions.length > 0
                        ? suggestions.map((e) => (
                              <div
                                  key={e.element}
                                  onMouseDown={(ev) => {
                                      ev.preventDefault();
                                      setValue(e.element);
                                  }}
                              >
                                  {e.element}
                              </div>
                          ))
                        : <div>No Results found</div>}
                </div>
            )}
        </div>
    );
}

export default AutoComplete;
