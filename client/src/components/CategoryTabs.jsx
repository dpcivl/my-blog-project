function CategoryTabs({ current, onChange }) {
    const categories = ['All', 'Blender', 'Roblox Studio', 'JavaScript'];

    return (
        <div style={{ marginBottom: "16px" }}>
            {categories.map(cat => (
                <button
                    key={cat}
                    style={{
                        marginRight: "8px",
                        fontWeight: current === cat ? 'bold' : 'normal'
                    }}
                    onClick={() => onChange(cat)}
                >
                    {cat}
                </button>
            ))}
        </div>
    );
}

export default CategoryTabs;