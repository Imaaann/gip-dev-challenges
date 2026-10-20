export default function ActionButton(
    props: React.HTMLAttributes<HTMLButtonElement>,
) {
    return (
        <button {...props} className="action-button">
            {props.children}
        </button>
    );
}
