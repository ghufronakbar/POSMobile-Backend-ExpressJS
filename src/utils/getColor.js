export const getColor = (index) => {
    const colors = [
        "#42b968",
        "#8cc5ff",
        "#fcaea4",
        "#23ACE3",
        "#808080",
        "#dbbda5",
        "#E8E4FF",
        "#B0A4FD",
        "#FFC107",
        "#9C27B0",
        "#03A9F4",
        "#8BC34A",
        "#E91E63",
        "#00BCD4",
        "#4CAF50",
    ]
    return colors[index % colors.length]
}