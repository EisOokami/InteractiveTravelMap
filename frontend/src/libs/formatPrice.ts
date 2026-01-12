export const formatPrice = (price: number) => {
    return price === 0 ? "Free" : `${price} $`;
};
