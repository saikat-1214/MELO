import asyncio
import logging
from sqlalchemy import select
from app.db.metadata import target_metadata
from app.db.session import AsyncSessionLocal
from app.modules.interests.models import ActivityCategory, Interest

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed")

CATEGORIES_DATA = [
    {
        "name": "Festivals & Culture",
        "slug": "festivals-culture",
        "description": "Cultural festivities, heritage celebrations, music festivals, and community fairs.",
        "icon": "sparkles",
    },
    {
        "name": "Sports & Fitness",
        "slug": "sports-fitness",
        "description": "Team sports, stadium matches, fitness groups, runs, and outdoor games.",
        "icon": "activity",
    },
    {
        "name": "Travel & Outdoors",
        "slug": "travel-outdoors",
        "description": "Weekend getaways, mountain treks, nature walks, and urban exploration.",
        "icon": "compass",
    },
    {
        "name": "Food & Cafés",
        "slug": "food-cafes",
        "description": "Exploring local culinary spots, café hopping, and authentic food tasting walks.",
        "icon": "coffee",
    },
    {
        "name": "Gaming & Tech",
        "slug": "gaming-tech",
        "description": "LAN parties, board game evenings, esports viewings, and developer hack groups.",
        "icon": "gamepad-2",
    },
    {
        "name": "Arts & Literature",
        "slug": "arts-literature",
        "description": "Book clubs, art exhibitions, theater plays, and creative workshops.",
        "icon": "book-open",
    },
]

INTERESTS_DATA = [
    # Festivals & Culture
    {"name": "Durga Puja & Heritage", "slug": "durga-puja-heritage", "category": "Festivals & Culture", "icon_name": "sparkles"},
    {"name": "Live Concerts & Gigs", "slug": "live-concerts", "category": "Festivals & Culture", "icon_name": "music"},
    {"name": "Cultural Festivals", "slug": "cultural-festivals", "category": "Festivals & Culture", "icon_name": "calendar"},
    {"name": "Street Theater & Drama", "slug": "theater-drama", "category": "Festivals & Culture", "icon_name": "drama"},
    
    # Sports & Fitness
    {"name": "Football", "slug": "football", "category": "Sports & Fitness", "icon_name": "trophy"},
    {"name": "Cricket", "slug": "cricket", "category": "Sports & Fitness", "icon_name": "trophy"},
    {"name": "Badminton", "slug": "badminton", "category": "Sports & Fitness", "icon_name": "target"},
    {"name": "Running & Marathons", "slug": "running-marathon", "category": "Sports & Fitness", "icon_name": "footprints"},
    {"name": "Yoga & Wellness", "slug": "yoga-wellness", "category": "Sports & Fitness", "icon_name": "sun"},
    
    # Travel & Outdoors
    {"name": "Weekend Road Trips", "slug": "weekend-trips", "category": "Travel & Outdoors", "icon_name": "car"},
    {"name": "Mountain Trekking & Hiking", "slug": "trekking-hiking", "category": "Travel & Outdoors", "icon_name": "mountain"},
    {"name": "Photography Walks", "slug": "photography-walks", "category": "Travel & Outdoors", "icon_name": "camera"},
    {"name": "Camping & Stargazing", "slug": "camping-stargazing", "category": "Travel & Outdoors", "icon_name": "tent"},
    
    # Food & Cafés
    {"name": "Café Hopping", "slug": "cafe-hopping", "category": "Food & Cafés", "icon_name": "coffee"},
    {"name": "Street Food Trails", "slug": "street-food-trails", "category": "Food & Cafés", "icon_name": "utensils"},
    {"name": "Baking & Cooking", "slug": "baking-cooking", "category": "Food & Cafés", "icon_name": "cookie"},
    
    # Gaming & Tech
    {"name": "Board Games & Chess", "slug": "board-games-chess", "category": "Gaming & Tech", "icon_name": "dices"},
    {"name": "PC & Console Gaming", "slug": "pc-console-gaming", "category": "Gaming & Tech", "icon_name": "gamepad"},
    {"name": "Hackathons & Tech Meetups", "slug": "hackathons-tech", "category": "Gaming & Tech", "icon_name": "code"},
    
    # Arts & Literature
    {"name": "Book Clubs & Reading", "slug": "book-clubs", "category": "Arts & Literature", "icon_name": "book-open"},
    {"name": "Art Exhibitions & Galleries", "slug": "art-exhibitions", "category": "Arts & Literature", "icon_name": "palette"},
    {"name": "Film Appreciation & Cinema", "slug": "film-appreciation", "category": "Arts & Literature", "icon_name": "film"},
]


async def seed_reference_data():
    logger.info("Seeding reference activity categories and interests...")
    async with AsyncSessionLocal() as session:
        # Seed Categories
        for cat in CATEGORIES_DATA:
            stmt = select(ActivityCategory).where(ActivityCategory.slug == cat["slug"])
            res = await session.execute(stmt)
            existing = res.scalar_one_or_none()
            if not existing:
                category = ActivityCategory(
                    name=cat["name"],
                    slug=cat["slug"],
                    description=cat["description"],
                    icon=cat["icon"],
                    is_active=True,
                )
                session.add(category)
                logger.info(f"Added category: {cat['name']}")

        # Seed Interests
        for item in INTERESTS_DATA:
            stmt = select(Interest).where(Interest.slug == item["slug"])
            res = await session.execute(stmt)
            existing = res.scalar_one_or_none()
            if not existing:
                interest = Interest(
                    name=item["name"],
                    slug=item["slug"],
                    category=item["category"],
                    icon_name=item["icon_name"],
                    is_system_defined=True,
                )
                session.add(interest)
                logger.info(f"Added interest: {item['name']}")

        await session.commit()
        logger.info("Reference data seeding complete.")


if __name__ == "__main__":
    asyncio.run(seed_reference_data())
