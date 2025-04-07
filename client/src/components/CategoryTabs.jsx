function CategoryTabs({ current, onChange }) {
    const categories = ['All', 'Blender', 'Game', 'IoT'];

    return (
        <div style={{ marginBottom: "16px" }}>
            {categories.map(cat => (
                <button
                    key={cat}
                    className={`category-button ${current === cat ? 'active' : ''}`}
                    onClick={() => onChange(cat)}
                >
                    {cat}
                </button>
            ))}
        </div>
    );
}

export default CategoryTabs;