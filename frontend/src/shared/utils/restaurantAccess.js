export const ADMIN_RESTAURANT_ROLE = "ADMIN_RESTAURANT_ROLE";

export const getEntityId = (entity) => {
    if (!entity) return "";
    if (typeof entity === "string" || typeof entity === "number") return String(entity);
    return String(entity._id || entity.id || entity.restaurante || "");
};

export const getUserId = (user) => String(user?.id || user?._id || user?.sub || "");

export const isRestaurantAdmin = (user) => user?.role === ADMIN_RESTAURANT_ROLE;

export const getUserRestaurantId = (user) => {
    const restaurant = user?.restaurante || user?.restaurant;
    if (restaurant) return getEntityId(restaurant);

    const restaurants = user?.restaurantes || user?.restaurants;
    if (Array.isArray(restaurants) && restaurants.length === 1) {
        return getEntityId(restaurants[0]);
    }

    return "";
};

export const getRestaurantOwnerId = (restaurant) => {
    const owner =
        restaurant?.dueno ||
        restaurant?.ownerId ||
        restaurant?.owner ||
        restaurant?.duenio ||
        restaurant?.["due\u00f1o"] ||
        restaurant?.["due\u00c3\u00b1o"];

    return getEntityId(owner);
};

export const getOwnedRestaurants = (user, restaurants = []) => {
    if (!isRestaurantAdmin(user)) return restaurants;

    const userRestaurantId = getUserRestaurantId(user);
    if (userRestaurantId) {
        return restaurants.filter((restaurant) => getEntityId(restaurant) === userRestaurantId);
    }

    const userId = getUserId(user);
    if (!userId) return restaurants;

    const ownedRestaurants = restaurants.filter((restaurant) => getRestaurantOwnerId(restaurant) === userId);
    if (ownedRestaurants.length) return ownedRestaurants;

    return restaurants.length === 1 ? restaurants : [];
};

export const getAllowedRestaurantIds = (user, restaurants = []) => {
    if (!isRestaurantAdmin(user)) return [];

    const userRestaurantId = getUserRestaurantId(user);
    if (userRestaurantId) return [userRestaurantId];

    const ownedIds = getOwnedRestaurants(user, restaurants)
        .map(getEntityId)
        .filter(Boolean);

    if (ownedIds.length) return ownedIds;

    if (restaurants.length === 1) {
        const onlyRestaurantId = getEntityId(restaurants[0]);
        return onlyRestaurantId ? [onlyRestaurantId] : [];
    }

    return [];
};

export const getRelationRestaurantId = (item) => {
    const restaurant = item?.restaurante || item?.restaurant;
    return getEntityId(restaurant);
};
