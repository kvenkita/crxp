/**
 * Plain-language "why this matters" briefs for each indicator. Keyed by indicator slug.
 * Written for residents, journalists, and community advocates (non-academic).
 *
 * `why` is markdown (paragraphs + bold); `resources` are real, authoritative links.
 * All links last checked 2026-11-17.
 *
 * House conventions, so this stays one voice as it grows:
 *  - Order follows manifest.categories: character, economy, education, engagement,
 *    environment, health, housing, transportation.
 *  - Open by bolding the term and its definition, under ~15 words. Evaluative claims go
 *    in sentence two, not the lead.
 *  - Two or three paragraphs, ~140 words. Let a short brief be short.
 *  - A Charlotte-specific closing paragraph is deliberate on "anchor" indicators only —
 *    roughly two per dimension. Don't add more without cutting one; see below.
 *  - Each local fact has ONE home. Language access -> limited-english-households.
 *    Immigrant growth -> foreign-born. Crescent/wedge in full -> black-residents.
 *    Reaching jobs without a car -> no-vehicle. Commute time -> mean-travel-time.
 *    Airport employment -> total-jobs. Housing bonds -> owner-occupied and rent-burden.
 *  - Provenance belongs in the generated "About the data" text (crxp-data), not here.
 *    The CDC PLACES no-trend caveat lives in the manifest's `trendNote` and is rendered
 *    by the app; don't restate it in these briefs.
 *  - Two or three resources. At most one sitewide local companion link per brief.
 *
 * Maintained as editorial content in the app repo (independent of the data pipeline).
 */
export const indicatorBriefs = {
	// ---------------- Character (general demographics) ----------------
	'total-population': {
		why: `**Total population is the headcount of an area** — how many people live there. It is the starting point for almost every other statistic, because counts like the number of children, seniors, or residents of a given background only make sense against the total. A "share" or a "rate" needs this denominator to mean anything.

Accurate population counts shape daily life. They guide how many seats a community gets in Congress and the state legislature, and they steer billions in federal funding for schools, roads, health clinics, and emergency services. Planners use them to decide where to build a new fire station, bus route, or library.

Population also reveals change over time. A county that is growing quickly faces different pressures (housing, traffic, school capacity) than one that is shrinking. Watching the total helps a community prepare rather than react.

The figure shown here comes from the Census Bureau’s American Community Survey (ACS) 5-year estimate, a rolling multi-year average, rather than the annual Population Estimates Program. It is best read as a recent average centered on the survey period, not a single-day headcount.`,
		resources: [
			{ title: 'U.S. Census Bureau — American Community Survey (ACS)', url: 'https://www.census.gov/programs-surveys/acs', note: 'The 5-year survey that produces the population figure shown here, down to small areas.' },
			{ title: 'U.S. Census Bureau — Population & Housing Unit Estimates', url: 'https://www.census.gov/programs-surveys/popest.html', note: 'A separate program with official annual population totals for states, counties, and cities.' },
			{ title: 'U.S. Census Bureau — Population topic page', url: 'https://www.census.gov/topics/population.html', note: 'Hub linking to population data, methods, and how counts drive funding and representation.' }
		]
	},
	'population-density': {
		why: `**Population density measures how crowded an area is** — the number of residents divided by its land area, usually shown as people per square mile. It captures the physical shape of a community: dense downtowns and apartment districts sit at the high end, while spread-out suburbs and rural farmland sit at the low end.

Density matters because it shapes what services make sense. Frequent bus service, sidewalks, and water and sewer lines are easier to justify where people live close together. In low-density areas, residents often rely on cars and wells, and services cost more per person to deliver.

Density is most meaningful for small areas like neighborhoods. A county-wide average can hide the difference between a packed urban core and empty open land.`,
		resources: [
			{ title: 'U.S. Census Bureau — Understanding Population Density', url: 'https://www.census.gov/newsroom/blogs/random-samplings/2015/03/understanding-population-density.html', note: 'Plain-language explainer on how density is calculated and why small-area figures are most useful.' },
			{ title: 'U.S. Census Bureau — Population & Housing Unit Estimates', url: 'https://www.census.gov/programs-surveys/popest.html', note: 'Source for the population counts that, paired with land area, produce density.' }
		]
	},
	'median-age': {
		why: `**Median age is the middle age of a community** — half of residents are younger and half are older. It is a quick way to tell whether an area skews young, like a college town or a neighborhood full of young families, or older, like a retirement-heavy community.

Age shapes what a community needs. A younger population leans on schools, child care, playgrounds, and entry-level jobs. An older population needs accessible housing, health care, transit options, and services that support aging in place.

It also signals change. The U.S. median age has risen for decades as people live longer and have fewer children. A neighborhood whose median age is climbing or falling fast may be on the edge of a larger shift in who lives there.`,
		resources: [
			{ title: 'U.S. Census Bureau — Older Population and Aging', url: 'https://www.census.gov/topics/population/older-aging.html', note: 'Data and stories on the aging U.S. population, including median-age trends by place.' },
			{ title: 'Population Reference Bureau — Aging in the United States', url: 'https://www.prb.org/resource/fact-sheet-aging-in-the-united-states/', note: 'Research summary on how and why the country’s age profile is shifting.' }
		]
	},
	'white-residents': {
		why: `**Non-Hispanic White residents** are people who identify as White and not Hispanic or Latino. Like all race and ethnicity counts, it reflects how people describe themselves on the census, not a biological category. It is one piece of a community’s overall makeup.

Tracking this share helps communities understand diversity and how it is changing. Nationally, the non-Hispanic White share has been gradually declining as other groups grow, and that pattern looks different from place to place.

The figure matters most alongside the others. Comparing group shares over time is how researchers study segregation, fair access to housing and services, and whether public institutions reflect the people they serve.

In Charlotte, this share traces the well-known "crescent vs. wedge" geography from the affluent side: the higher-income, predominantly White wedge that fans southeast from uptown. No share is good or bad on its own. What the map records is how the region’s institutions sorted opportunity.`,
		resources: [
			{ title: 'U.S. Census Bureau — Why We Ask: Race', url: 'https://www.census.gov/acs/www/about/why-we-ask-each-question/race/', note: 'Explains how race is self-reported and how the data support civil rights and planning.' },
			{ title: 'Leading on Opportunity — The Impact of Segregation', url: 'https://www.leadingonopportunity.org/the-impact-of-segregation/', note: 'How Charlotte’s crescent/wedge segregation shapes opportunity and mobility.' },
			{ title: 'Brookings — The nation is diversifying even faster than predicted', url: 'https://www.brookings.edu/articles/new-census-data-shows-the-nation-is-diversifying-even-faster-than-predicted/', note: 'Analysis of long-run trends in the White population share and growing U.S. diversity.' }
		]
	},
	'black-residents': {
		why: `**This measure shows the share of residents who are Black or African American.** Like other race counts, it is based on how people identify themselves, and it reflects a diverse community that includes people with long U.S. roots as well as more recent immigrants from Africa, the Caribbean, and elsewhere.

This share matters for understanding a community’s history and present. In the Charlotte region and across the South, where most Black Americans live, these patterns are tied to decades of housing, schooling, and economic policy. The data also support fairness: they are used to enforce voting rights and fair-housing laws, to plan services, and to study segregation and equity.

In Charlotte, segregation has a specific, mappable shape often called the "crescent vs. wedge." An affluent, predominantly White wedge fans southeast from uptown and holds a disproportionate share of the city’s wealth on a small share of its land. A crescent of lower-income, majority-Black, Latino, and immigrant neighborhoods wraps the north, west, and east. That shape is a legacy of redlining, exclusionary single-family zoning, and interstate routing. Researchers identify segregation as one of the strongest correlates of low upward mobility, so a race-composition map here doubles as a map of where opportunity and investment have or haven’t reached. No share is good or bad on its own. The point is that the region’s institutions sorted opportunity along these lines.`,
		resources: [
			{ title: 'Pew Research Center — Facts about the U.S. Black population', url: 'https://www.pewresearch.org/race-and-ethnicity/fact-sheet/facts-about-the-us-black-population/', note: 'Demographic profile covering size, growth, geography, and diversity within the population.' },
			{ title: 'U.S. Census Bureau — Why We Ask: Race', url: 'https://www.census.gov/acs/www/about/why-we-ask-each-question/race/', note: 'How race data are collected and used to enforce civil rights and allocate services.' },
			{ title: 'Leading on Opportunity — The Impact of Segregation', url: 'https://www.leadingonopportunity.org/the-impact-of-segregation/', note: 'How Charlotte’s crescent/wedge segregation shapes opportunity and mobility.' }
		]
	},
	'hispanic-residents': {
		why: `**This measure shows the share of residents who are Hispanic or Latino** — people of Cuban, Mexican, Puerto Rican, Central or South American, or other Spanish-speaking heritage. The Census treats this as an ethnicity, separate from race, so Hispanic residents may be of any race. People report it themselves.

This share helps communities plan and serve everyone well. It informs decisions about bilingual services, schools, health outreach, and where to locate facilities. In many parts of the Charlotte region, the Hispanic population has grown quickly, reshaping neighborhoods, businesses, and classrooms.

The data also support fair treatment: upholding voting rights, including language assistance at the polls, and studying whether public programs reach Hispanic residents equitably.`,
		resources: [
			{ title: 'U.S. Census Bureau — Why We Ask: Hispanic or Latino Origin', url: 'https://www.census.gov/acs/www/about/why-we-ask-each-question/ethnicity/', note: 'Explains the Hispanic-origin question, why it is separate from race, and how data are used.' },
			{ title: 'U.S. Census Bureau — 2020 Census: a more diverse nation', url: 'https://www.census.gov/library/stories/2021/08/2020-united-states-population-more-racially-ethnically-diverse-than-2010.html', note: 'Shows the Hispanic population’s growth and role in national diversity, with state comparisons.' }
		]
	},
	'asian-residents': {
		why: `**Asian residents** form a broad, self-identified category spanning more than two dozen origin groups with roots in East, South, Southeast, and Central Asia, each with its own language, culture, and history. A single number summarizes a diverse population.

This share helps communities plan inclusively. It can inform language access, cultural programming, small-business support, and health outreach. The Asian population is among the fastest-growing in the country, and in fast-growing metros like Charlotte that growth can reshape neighborhoods and schools.

Because the category covers so many distinct communities, the share is best read as a starting point, not the full story.`,
		resources: [
			{ title: 'Pew Research Center — Asian Americans in the U.S.', url: 'https://www.pewresearch.org/race-and-ethnicity/fact-sheet/asian-americans-in-the-u-s/', note: 'Profile of the Asian population’s size, rapid growth, origin groups, and geography.' },
			{ title: 'U.S. Census Bureau — Why We Ask: Race', url: 'https://www.census.gov/acs/www/about/why-we-ask-each-question/race/', note: 'Explains how the Asian category is reported and how race data guide services.' }
		]
	},
	'other-race-residents': {
		why: `**This measure groups residents who are another race or who identify with two or more races.** It captures people whose backgrounds do not fit a single standard category, including a fast-growing multiracial population. As with all race data, it reflects how people choose to describe themselves.

This group has grown sharply, and it skews young: multiracial residents have one of the lowest median ages of any group. Part of the recent jump also comes from improvements in how the Census collects and codes answers, so compare across years with care.`,
		resources: [
			{ title: 'U.S. Census Bureau — A third reporting two or more races were under 18', url: 'https://www.census.gov/library/stories/2023/06/nearly-a-third-reporting-two-or-more-races-under-18-in-2020.html', note: 'Examines the youthful, fast-growing multiracial population and data-processing changes.' },
			{ title: 'U.S. Census Bureau — 2020 Census: a more diverse nation', url: 'https://www.census.gov/library/stories/2021/08/2020-united-states-population-more-racially-ethnically-diverse-than-2010.html', note: 'Context on rising diversity and how multiple-race responses are measured.' }
		]
	},
	'foreign-born': {
		why: `**Foreign-born residents** are people who were born in another country and now live here. The group includes naturalized U.S. citizens, green-card holders, students, workers, and others. It is a measure of where people were born, not their current legal status.

Knowing how many residents are foreign-born helps a community plan well. Newcomers may need help learning English, getting professional licenses recognized, or finding their way around local services. Schools, clinics, and libraries can tailor programs when they understand who lives nearby.

Immigrant residents also strengthen a region. They start businesses, fill jobs, and add to the cultural life of a place. The Charlotte region has grown quickly as an immigrant destination, with established communities along corridors like Central Avenue and South Boulevard, and this map is the clearest view of where that growth has settled.`,
		resources: [
			{ title: 'U.S. Census Bureau — About the Foreign-Born Population', url: 'https://www.census.gov/topics/population/foreign-born/about.html', note: 'Definitions and overview of who is counted as foreign-born and how the data are collected.' },
			{ title: 'Pew Research Center — Key findings about U.S. immigrants', url: 'https://www.pewresearch.org/short-reads/2025/08/21/key-findings-about-us-immigrants/', note: 'Plain-language roundup of national data on the size, origins, and traits of immigrants.' }
		]
	},
	'limited-english-households': {
		why: `**A limited-English-speaking household** is one where no member age 14 or older speaks English "very well." These households may speak another language at home and still manage daily life, but they can struggle when key information comes only in English.

This measure matters for safety and fairness. During emergencies like storms or evacuations, instructions must reach everyone quickly. The same is true for health notices, court papers, school forms, and voting materials. When a community knows where language needs are highest, it can offer interpreters, translated documents, and bilingual staff.

This is about access, not ability. Many residents in these households are working, raising families, and contributing fully. For schools, courts and election offices in this region, the map is a practical guide to where interpreters and translated materials need to be.`,
		resources: [
			{ title: 'U.S. Census Bureau — About Language Use', url: 'https://www.census.gov/topics/population/language-use/about.html', note: 'How the Census defines and measures limited-English-speaking households.' },
			{ title: 'U.S. Census Bureau — Why We Ask About Language', url: 'https://www.census.gov/acs/www/about/why-we-ask-each-question/language/', note: 'How agencies use language data to plan services and reach non-English speakers.' }
		]
	},
	youth: {
		why: `**Youth** are residents under age 18. This share tells a community how many children and teens it is raising, and it shapes demand for many everyday services.

A larger young population means more need for schools, classrooms, and teachers, plus childcare, after-school programs, pediatric care, parks, and playgrounds. Planners use this number to decide where to build schools, how to route buses, and where families with kids cluster.`,
		resources: [
			{ title: 'U.S. Census Bureau — About the Child Population', url: 'https://www.census.gov/topics/population/children/about.html', note: 'Overview of how the Census measures the under-18 population.' },
			{ title: 'U.S. Census Bureau — Older adults outnumber children in 11 states', url: 'https://www.census.gov/newsroom/press-releases/2025/older-adults-outnumber-children.html', note: 'Recent data story comparing the youth and older-adult shares across places.' }
		]
	},
	'older-adults': {
		why: `**Older adults** are residents age 65 and older. Thanks to longer lives and the large baby-boom generation, this group is growing quickly across the country, making it one of the most important numbers for local planning.

More older adults means more demand for healthcare, home services, and accessible transit for people who no longer drive. It also shapes housing, since many seniors want to stay in their own homes and communities as they age.

Older residents are also active contributors: they volunteer, work, care for grandchildren, and anchor neighborhoods.`,
		resources: [
			{ title: 'ACL — Profile of Older Americans', url: 'https://acl.gov/aging-and-disability-in-america/data-and-research/profile-older-americans', note: 'Annual federal summary of demographics, income, and health for adults 65+.' },
			{ title: 'Population Reference Bureau — Aging in the United States', url: 'https://www.prb.org/resource/fact-sheet-aging-in-the-united-states/', note: 'Accessible fact sheet on the growth and characteristics of the older population.' },
			{ title: 'AARP Livability Index', url: 'https://livabilityindex.aarp.org/', note: 'Interactive tool scoring how well communities support residents of all ages.' }
		]
	},
	'households-with-children': {
		why: `**Households with children** are homes where at least one child under 18 lives. This counts families rather than individual kids, which gives a clearer picture of how many homes are raising the next generation.

This measure shapes the services families rely on most. Areas with many such households need good schools, childcare, pediatric care, parks, and family-sized housing. It also helps target programs like school meals and family support, and guides decisions about library hours, bus routes, and recreation.

The share also reflects a community’s character and direction. Neighborhoods full of young families have different needs than those with mostly adults living alone.`,
		resources: [
			{ title: 'U.S. Census Bureau — Families and Households', url: 'https://www.census.gov/topics/families/families-and-households.html', note: 'Hub for data on household composition, including the presence of children under 18.' },
			{ title: 'U.S. Census Bureau — Family households', url: 'https://www.census.gov/library/stories/2024/11/family-households.html', note: 'Plain-language look at how many households include children and how that has changed.' }
		]
	},
	'households-with-seniors': {
		why: `**Households with seniors** are homes where at least one person age 65 or older lives. This is different from simply counting older adults, because it shows the living situations seniors are in, whether alone, with a spouse, or with younger family members.

This measure helps communities plan support that reaches the home. Homes with older residents may need accessibility features, in-home care, help with utilities, or safe transportation. Knowing where these households cluster helps target home repairs, meal delivery, and emergency check-ins — and the living arrangement matters, since a senior living alone may need more outside support than one living with family.`,
		resources: [
			{ title: 'U.S. Census Bureau — Older Population and Aging', url: 'https://www.census.gov/topics/population/older-aging.html', note: 'Census data on the 65-and-older population, including living arrangements.' },
			{ title: 'ACL — Profile of Older Americans', url: 'https://acl.gov/aging-and-disability-in-america/data-and-research/profile-older-americans', note: 'Federal data on how older adults live, including alone or with family.' }
		]
	},
	veterans: {
		why: `**Veterans** are adults who served in the U.S. armed forces and are no longer on active duty. Counting them helps a community understand a group that may qualify for special health care, education, housing, and disability benefits through the Department of Veterans Affairs.

This number guides local planning. Areas with many veterans may need VA clinics, mental health and disability services, job programs, and outreach to make sure people know what they have earned.`,
		resources: [
			{ title: 'U.S. Census Bureau — About the Veterans Population', url: 'https://www.census.gov/topics/population/veterans/about.html', note: 'How the Census defines and counts veterans and what the data cover.' },
			{ title: 'VA — National Center for Veterans Analysis and Statistics', url: 'https://www.va.gov/vetdata/veteran_population.asp', note: 'Official VA veteran population data and projections by age, sex, and location.' }
		]
	},

	// ---------------- Economy ----------------
	'household-income': {
		why: `**Median household income** is the income earned by a household right in the middle of the pack: half of households earn more, and half earn less. Unlike an average, it isn’t thrown off by a handful of the highest earners, so it gives a fair picture of how a typical family is doing.

Income shapes nearly every part of daily life: whether a family can cover rent, afford healthy food, handle a car repair, or save for the future. When typical incomes rise faster than the cost of living, families gain breathing room. When they stall, even working households can struggle.

Comparing median income across neighborhoods and counties helps show where good-paying work is within reach and where it is harder to get ahead.

Income tells only part of the story. Whether children can climb beyond their parents’ income is Charlotte’s defining question. A landmark mobility study found a Charlotte child from the bottom income fifth had a 4.4% chance of reaching the top — versus 12.9% in San Jose and 10.8% in Salt Lake City. The Opportunity Atlas lets you trace these patterns down to the neighborhood.`,
		resources: [
			{ title: 'U.S. Census Bureau — Income in the United States: 2024', url: 'https://www.census.gov/library/publications/2025/demo/p60-286.html', note: 'The latest national report on household income, with the official median and trends.' },
			{ title: 'U.S. Census Bureau — About Income', url: 'https://www.census.gov/topics/income-poverty/income/about.html', note: 'Explains how the Census defines and measures money income.' },
			{ title: 'The Opportunity Atlas', url: 'https://www.opportunityatlas.org/', note: 'Interactive maps of children’s adult earnings by the neighborhood where they grew up.' }
		]
	},
	'poverty-rate': {
		why: `**The poverty rate** is the share of people whose household income falls below the federal poverty line, a dollar amount the government sets based on family size. If a family earns less than their threshold, everyone in it is counted as living in poverty.

Poverty is about more than money. People with the lowest incomes are more likely to face food insecurity, unstable housing, untreated health problems, and added stress — all of which can make it harder to work, learn, and stay healthy.

Tracking the poverty rate shows how many neighbors are struggling to afford basics, and where extra support could make the biggest difference. A high rate signals greater need, not a judgment about the people or place.

In the Charlotte region, poverty maps are inseparable from the area’s defining civic challenge: economic mobility. In 2014 Charlotte ranked last of the 50 largest U.S. metros for a poor child’s odds of reaching the top income fifth. That finding launched the Charlotte-Mecklenburg Opportunity Task Force and the Leading on Opportunity initiative. The initiative targets early care and education, child and family stability, and college and career readiness, alongside segregation and social capital.`,
		resources: [
			{ title: 'U.S. Census Bureau — How Poverty Is Measured', url: 'https://www.census.gov/topics/income-poverty/poverty/guidance/poverty-measures.html', note: 'Plain explanation of poverty thresholds and the income used to decide who is in poverty.' },
			{ title: 'Leading on Opportunity', url: 'https://www.leadingonopportunity.org/', note: 'The local initiative born from Charlotte’s 50-of-50 mobility ranking, with its priorities and progress.' },
			{ title: 'U.S. Census Bureau — About Poverty', url: 'https://www.census.gov/topics/income-poverty/poverty/about.html', note: 'Overview of the official poverty measure, its history, and data sources.' }
		]
	},
	'child-poverty': {
		why: `**Child poverty** here measures the share of families with related children under 18 whose income falls below the poverty line, a family-weighted companion to the overall poverty rate. Children can’t control their family’s finances, so this number captures how many households raising kids are doing so without enough resources.

Growing up in poverty can leave lasting marks. Children raised below the line have worse health, lower school achievement, and lower earnings as adults. From an early age, financial hardship raises the risk of chronic conditions and limits access to stable housing, nutritious food, and health care.

Because early circumstances shape long-term opportunity, child poverty is one of the strongest signals of a community’s future. That link is the heart of Charlotte’s defining civic question. In a landmark study, economists Raj Chetty, Nathaniel Hendren and colleagues (2014) found a Charlotte child raised in the bottom income fifth had just a 4.4% chance of reaching the top fifth, last of the 50 largest U.S. metros. For comparison, the odds were 12.9% in San Jose and 10.8% in Salt Lake City. That finding launched the Charlotte-Mecklenburg Opportunity Task Force and the Leading on Opportunity initiative. An updated 2024 analysis shows the region has since improved to about 38th of 50.`,
		resources: [
			{ title: 'County Health Rankings — Children in Poverty', url: 'https://www.countyhealthrankings.org/health-data/health-factors/social-economic-factors/income/children-in-poverty', note: 'Research-backed explainer on how child poverty affects health and long-term outcomes.' },
			{ title: 'Opportunity Insights — Where is the Land of Opportunity?', url: 'https://opportunityinsights.org/paper/land-of-opportunity/', note: 'The 2014 study behind Charlotte’s mobility ranking, and the five factors most associated with mobility.' },
			{ title: 'The Opportunity Atlas', url: 'https://www.opportunityatlas.org/', note: 'Maps children’s adult outcomes by the neighborhood where they grew up.' }
		]
	},
	'unemployment-rate': {
		why: `**The unemployment rate** is the share of the labor force (people who are working or actively looking for work) who are jobless but searching. People who aren’t looking for work, such as retirees or full-time students, aren’t counted.

When unemployment is high, more families lose a steady paycheck, and that can ripple into missed bills, lost health insurance, and added stress. Joblessness is also tied to worse physical and mental health. A rising rate often signals a weakening local economy.

Because it focuses on people who want jobs but can’t find them, the unemployment rate is a quick read on whether work is available in a community.`,
		resources: [
			{ title: 'BLS — How the Government Measures Unemployment', url: 'https://www.bls.gov/cps/cps_htgm.htm', note: 'Official guide to how unemployment and the labor force are defined and counted.' },
			{ title: 'County Health Rankings — Unemployment', url: 'https://www.countyhealthrankings.org/health-data/health-factors/social-economic-factors/employment/unemployment', note: 'Why joblessness matters for health and economic security in a community.' }
		]
	},
	employment: {
		why: `**The employment rate** here is the employment-population ratio, the share of all people age 16 and older who actually have a job. Unlike the unemployment rate, it counts everyone in this age group, including people who have stopped looking for work, so it can reveal hidden gaps the unemployment rate misses.

A job is one of the main ways people gain income, health insurance, and a sense of stability. When more adults are employed, more households can cover their needs and contribute to the local economy. When the rate is low, it can mean limited opportunities, barriers like child care or transportation, or workers who have given up the search.

Looking at the employment rate alongside unemployment gives a clearer view of how well a community connects residents to work. Neither number alone is enough.`,
		resources: [
			{ title: 'BLS — Employment-Population Ratio', url: 'https://www.bls.gov/charts/employment-situation/employment-population-ratio.htm', note: 'Measure of employed people as a share of the adult population.' },
			{ title: 'BLS — How the Government Measures Unemployment', url: 'https://www.bls.gov/cps/cps_htgm.htm', note: 'Defines who counts as employed, unemployed, and in the labor force.' }
		]
	},
	'snap-households': {
		why: `**SNAP** stands for the Supplemental Nutrition Assistance Program, the federal program once known as food stamps. It helps people with low incomes buy groceries, with benefits loaded onto a card that works like a debit card. This indicator shows the share of households receiving that help.

A higher share means more families are stretched thin enough to need food assistance, often because of low wages, job loss, or high costs. SNAP eases hunger, frees up money for rent and medicine, and is linked to better health, especially for children.

Because it responds quickly to economic stress, SNAP enrollment is a useful gauge of need. It reflects circumstances, not the character of the families or neighborhoods involved.

Across this region the spread is wide, and it does not follow the urban core. Regionally the share has fallen over the past decade, but it still runs about five times higher in Anson County than in York County, South Carolina. Rural need here can run deeper than anywhere in metropolitan Charlotte, and it is easier to overlook.`,
		resources: [
			{ title: 'USDA — Supplemental Nutrition Assistance Program (SNAP)', url: 'https://www.fns.usda.gov/snap/supplemental-nutrition-assistance-program', note: 'Official overview of how SNAP works, who it serves, and how benefits are used.' },
			{ title: 'USDA — SNAP Eligibility', url: 'https://www.fns.usda.gov/snap/recipient/eligibility', note: 'The income and household rules that determine who qualifies for SNAP.' }
		]
	},
	'gini-index': {
		why: `**The Gini index** is a single score, from 0 to 1, that sums up how evenly income is spread across a community. A score of 0 would mean everyone earns exactly the same. A score of 1 would mean one household has all the income. Higher numbers mean income is concentrated among fewer people.

Inequality matters because it shapes opportunity. Where the gap between the top and everyone else is wide, working families may find it harder to afford housing, save money, or move up. Large gaps are also linked to weaker community trust and worse health outcomes.

The Gini index doesn’t say whether a place is rich or poor overall. Instead, it shows how the area’s income is shared.

Mecklenburg County is the most unequal county in this region and has stayed there for the whole series, while the least unequal counties sit several points lower. That pairing is worth sitting with. The region’s wealthiest county is also the one where income is spread most unevenly. That is the same tension the mobility research put at the center of Charlotte’s civic debate.`,
		resources: [
			{ title: 'U.S. Census Bureau — Income Inequality Metrics', url: 'https://www.census.gov/topics/income-poverty/income-inequality/about/metrics.html', note: 'Official definition of the Gini index on a 0–1 scale, with the other inequality measures Census publishes.' },
			{ title: 'U.S. Census Bureau — Understanding Income Inequality', url: 'https://www.census.gov/library/stories/2023/09/income-inequality.html', note: 'Accessible story explaining inequality measures and recent national trends.' }
		]
	},
	'white-collar': {
		why: `**Management, business, science, and arts occupations** are one of the Census Bureau’s five broad occupation groups, covering jobs like managers, teachers, nurses, engineers, accountants, and software developers. This indicator shows the share of local workers in that group, which usually requires more formal education or training and tends to pay higher wages.

This measure is mainly context: it describes the kind of work a community’s residents do. A higher share often points to more office-based and credentialed jobs. A lower share may reflect an economy built more on service, manufacturing, or hands-on trades, all of which are essential.

Looking at the mix of occupations helps explain local income patterns and which industries are growing. No mix is better than another.`,
		resources: [
			{ title: 'U.S. Census Bureau — Why We Ask: Industry, Occupation, and Class of Worker', url: 'https://www.census.gov/acs/www/about/why-we-ask-each-question/occupation/', note: 'The occupation question behind this indicator, and the broad groups the Census sorts answers into.' },
			{ title: 'BLS — Occupational Employment and Wage Statistics', url: 'https://www.bls.gov/oes/current/oes_stru.htm', note: 'Data on employment and pay across detailed occupations.' }
		]
	},
	'internet-access': {
		why: `**Household internet access** measures the share of homes with a broadband (high-speed) internet subscription. Today, a reliable connection is a basic tool for everyday life, not a luxury.

Without home internet, it is harder to apply for jobs, do schoolwork, see a doctor through telehealth, reach government services, or compare prices and pay bills. Gaps in access, sometimes called the digital divide, often fall hardest on lower-income households, rural areas, and older residents.

Tracking who has broadband at home shows where people can fully take part in the modern economy and where investment or affordability programs are needed. In this region the gap follows income closely: across tracts, broadband subscription and median household income move together strongly, and the link to a neighborhood’s racial composition is much weaker. This is a cost gap first. Local digital-inclusion efforts have worked to get devices and connections to students and lower-income households so the same neighborhoods already facing other gaps don’t fall further behind.`,
		resources: [
			{ title: 'U.S. Census Bureau — Why We Ask: Computer & Internet Use', url: 'https://www.census.gov/acs/www/about/why-we-ask-each-question/computer/', note: 'How the Census measures home internet and broadband and why it matters.' },
			{ title: 'U.S. Census Bureau — Computer and Internet Use', url: 'https://www.census.gov/newsroom/press-releases/2024/computer-internet-use-2021.html', note: 'National findings on broadband subscription rates, including urban–rural gaps.' }
		]
	},
	'total-jobs': {
		why: `**Total jobs counts the work that happens in a place**, not the work done by the people who live there. Every job is counted at the address of the worksite. A tract holding one large hospital, warehouse or office tower can contain thousands of jobs and almost no residents. A quiet residential neighborhood can contain almost none, even though nearly everyone living there is employed.

That makes this the natural companion to the employment and unemployment rates, which count residents. Read side by side, they show whether a neighborhood is a place people travel to for work or travel from. Planners use the workplace count to size roads, transit, water and sewer; emergency managers use it to estimate how many people are in a tract during the workday rather than overnight.

In this region the contrast is stark. Uptown Charlotte and the corridor around Charlotte Douglas International Airport hold job counts far beyond their resident populations, while much of the region outside those centers sends its workers elsewhere each morning. Neither pattern is better than the other. Over time the count shows where employment is concentrating and where it is spreading out.`,
		resources: [
			{ title: 'U.S. Census Bureau — LEHD data products', url: 'https://lehd.ces.census.gov/data/', note: 'The source program, including the LODES workplace files this indicator is built from.' },
			{ title: 'U.S. Census Bureau — OnTheMap', url: 'https://onthemap.ces.census.gov/', note: 'Interactive federal tool for mapping where people work against where they live, built on the same data.' },
			{ title: 'U.S. Census Bureau — LODES technical documentation (PDF)', url: 'https://lehd.ces.census.gov/doc/help/onthemap/LODESTechDoc.pdf', note: 'How the job counts are assembled, and how noise is added to protect individual employers.' }
		]
	},
	'job-density': {
		why: `**Job density is how many jobs are packed into each square mile.** It turns the raw count into a measure of intensity: 5,000 jobs spread thinly across a rural county look nothing like 5,000 jobs stacked into a few downtown blocks, even though the count is identical.

Density is what makes certain things possible. Frequent bus and rail service, sidewalks that lead somewhere, lunch spots and childcare near the office, and shared parking all depend on enough jobs sitting close together. It also explains local pressures, because the densest employment areas generate the heaviest peak-hour traffic, the most pavement and the brightest night-time light.

This is a descriptive measure rather than a good-or-bad one. A dense employment center and a low-density rural tract are different kinds of places, not better and worse ones. Comparing job density against population density on the same map is the quickest way to see which neighborhoods are workplaces, which are bedrooms and which manage to be both.`,
		resources: [
			{ title: 'U.S. Census Bureau — OnTheMap', url: 'https://onthemap.ces.census.gov/', note: 'Maps the concentration of jobs and the commutes that feed them, from the same LODES data.' },
			{ title: 'EPA — Smart Location Mapping', url: 'https://www.epa.gov/smartgrowth/smart-location-mapping', note: 'National database that uses employment density (jobs per acre) among its measures of location efficiency.' }
		]
	},
	'jobs-housing-balance': {
		why: `**Jobs–housing balance is workplace jobs divided by households.** A value near 1 means roughly one local job for every local home. Well above 1 marks an employment center that pulls workers in each morning; well below 1 marks a bedroom community that sends them out.

The balance matters because it drives commuting. Where homes and jobs sit far apart, people spend more time and money getting between them, road and transit costs rise, and households without a reliable car are cut off from work they could otherwise reach. Places that bring the two closer together, by adding housing near job centers or jobs near existing neighborhoods, tend to have shorter trips and more ways to make them. It is one of the oldest ideas in land-use planning and one of the easiest to measure.

One caution worth carrying: the ratio says nothing about fit. A tract can hold one job per household while few of the residents are qualified for, or paid enough by, the jobs next door. Read it alongside income and occupation rather than on its own.`,
		resources: [
			{ title: 'EPA — Smart Location Mapping', url: 'https://www.epa.gov/smartgrowth/smart-location-mapping', note: 'National database that includes jobs per housing unit among its built-environment measures.' },
			{ title: 'U.S. Census Bureau — OnTheMap', url: 'https://onthemap.ces.census.gov/', note: 'Shows the commuting flows that a jobs–housing imbalance produces, for any area you draw.' }
		]
	},

	// ---------------- Education ----------------
	'bachelors-or-higher': {
		why: `**Bachelor’s attainment** is the share of adults age 25 and older holding at least a four-year degree. It is one of the clearest signals of a community’s skill base and the kinds of jobs people can reach.

The payoff is large and well documented. Adults with a bachelor’s degree typically earn far more over their lifetimes than those who stopped at high school. More education is also tied to better health, longer life expectancy, and steadier employment.

For a region, a higher share of college graduates can attract employers and support a stronger tax base, but the number also raises fairness questions about who has access to college.

In Charlotte, "college and career readiness" was one of the three determinants the Leading on Opportunity initiative named after the region ranked last among large U.S. metros for upward mobility, making who reaches a degree a central equity question, not just an economic one.`,
		resources: [
			{ title: 'U.S. Census Bureau — Educational Attainment', url: 'https://www.census.gov/topics/education/educational-attainment.html', note: 'National, state, and county data on degrees held by adults, with historical trends.' },
			{ title: 'NCES — Annual Earnings by Educational Attainment', url: 'https://nces.ed.gov/programs/coe/indicator/cba/annual-earnings', note: 'Federal data showing how median earnings rise with each level of education.' },
			{ title: 'Leading on Opportunity', url: 'https://www.leadingonopportunity.org/', note: 'Charlotte’s mobility initiative, which names college and career readiness a core determinant.' }
		]
	},
	'high-school-diploma': {
		why: `**High school completion** is the share of adults age 25 and older who have finished high school or earned an equivalent credential like a GED. It is a foundation for nearly all further education and most steady jobs.

Finishing high school is strongly linked to better health. People with a diploma tend to live longer, report better health, and have lower rates of conditions like diabetes, much of it through the higher earnings and more stable lives a diploma helps make possible.

When a large share of adults lack this credential, it can signal gaps in schools, economic strain, or barriers that pushed people out of education.`,
		resources: [
			{ title: 'County Health Rankings — High School Completion', url: 'https://www.countyhealthrankings.org/health-data/community-conditions/social-and-economic-factors/education/high-school-completion', note: 'How high school completion connects to health, with county-level estimates.' },
			{ title: 'U.S. Census Bureau — Educational Attainment', url: 'https://www.census.gov/topics/education/educational-attainment.html', note: 'Source for the share of adults who have completed high school, by place.' }
		]
	},
	'school-enrollment': {
		why: `**Enrollment shows who is actively learning right now.** This measure captures the share of people age 3 and older who are enrolled in school, from preschool all the way through college and graduate study.

Early enrollment matters because preschool helps children arrive at kindergarten ready to learn. Strong enrollment in the later years signals that teens are staying in school and that adults are pursuing college or training that can lift their earnings.

Enrollment patterns also help local leaders plan classroom space, teachers, child care, and college programs. Shifts up or down can be an early sign of population change or new demand.

In the Charlotte region, enrollment patterns also reflect a longer story. Charlotte-Mecklenburg Schools moved away from court-ordered busing to neighborhood schools in 2002, and schools resegregated along residential lines. Peer-reviewed research (Billings, Deming & Rockoff, 2014) tied that change to widened racial inequality in school outcomes.`,
		resources: [
			{ title: 'U.S. Census Bureau — School Enrollment', url: 'https://www.census.gov/topics/education/school-enrollment.html', note: 'Data on enrollment from preschool through college, including public and private.' },
			{ title: 'U.S. Census Bureau — Why We Ask: School Enrollment', url: 'https://www.census.gov/acs/www/about/why-we-ask-each-question/school/', note: 'How enrollment data is collected and used to plan schools and services.' },
			{ title: 'EdNC — Charlotte, the Swann decision, and resegregation', url: 'https://www.ednc.org/45-years-after-the-swann-decision-charlotte-continues-to-debate-race-poverty-and-education/', note: 'Background on CMS desegregation history and its echoes in today’s enrollment.' }
		]
	},
	'private-school': {
		why: `**Private school enrollment** is the share of enrolled students attending private, non-public schools rather than public ones. It is useful context for conversations about school choice and public-school investment.

Nationally, private schools enroll a minority of students, but the share varies widely from place to place. Where it is high, it can reflect strong religious-school traditions, family income, or how confident families feel in nearby public schools.

The number does not say one type of school is better. Because public schools serve most students and a more economically mixed population, watching private enrollment alongside public investment can highlight questions of access and fairness.

In Charlotte, these patterns sit on a notable history. Charlotte-Mecklenburg Schools was once a national model for busing-based integration under the Swann ruling. After that order ended and CMS returned to neighborhood schools in 2002, schools resegregated along residential lines. Peer-reviewed research (Billings, Deming & Rockoff, *Quarterly Journal of Economics*, 2014) found that the change widened racial inequality in test scores, educational attainment and crime. The pattern reflects where families live and past policy choices, not the worth of any school or family.`,
		resources: [
			{ title: 'NCES — Private School Enrollment', url: 'https://nces.ed.gov/programs/coe/indicator/cgc/private-school-enrollment', note: 'Federal data on private K–12 enrollment, including how the share varies by state.' },
			{ title: 'NCES — Public vs. private schools (Fast Facts)', url: 'https://nces.ed.gov/fastfacts/display.asp?id=55', note: 'Quick comparison of enrollment and student characteristics across school types.' },
			{ title: 'EdNC — Charlotte, the Swann decision, and resegregation', url: 'https://www.ednc.org/45-years-after-the-swann-decision-charlotte-continues-to-debate-race-poverty-and-education/', note: 'How CMS moved from busing-based integration to neighborhood schools, and what followed.' }
		]
	},

	// ---------------- Engagement ----------------
	'residential-stability': {
		why: `**Residential stability** measures the share of residents who lived in the same home one year ago. It is a widely used proxy for rootedness: conditions associated with stronger social ties, local knowledge, and civic participation.

It is an indirect measure: it reflects who stays put, not whether people vote, volunteer, or join groups, which this survey does not capture. Churn cuts both ways. Moving can mean a new job, a better home, or a growing family, just as it can mean instability or being priced out.

Read in context, this number helps show where neighborhoods have settled and where churn is high. In fast-growing parts of the Charlotte region, lower stability often reflects rapid in-migration and new construction. Elsewhere it can signal housing pressure and frequent forced moves.`,
		resources: [
			{ title: 'U.S. Census Bureau — Why We Ask: Migration', url: 'https://www.census.gov/acs/www/about/why-we-ask-each-question/migration/', note: 'How the "residence one year ago" question is collected and used.' },
			{ title: 'U.S. Census Bureau — Geographic Mobility / Migration', url: 'https://www.census.gov/topics/population/migration.html', note: 'Data on how often Americans move and the reasons they give.' },
			{ title: 'Charlotte-Mecklenburg Quality of Life Explorer', url: 'https://ui.charlotte.edu/our-work/quality-life-explorer/', note: 'Tracks neighborhood turnover and dozens of other measures for 462 small areas in Mecklenburg County.' }
		]
	},

	// ---------------- Environment ----------------
	'tree-canopy': {
		why: `**Tree canopy** is the share of ground shaded by leaves, branches and stems, seen from above. Where canopy is high, neighborhoods stay cooler, the air is cleaner, and rain is slowed before it floods streets.

Trees do real work. Their shade and the water they release can drop nearby temperatures by several degrees on a hot day, which lowers cooling bills and protects people from heat illness. Leaves also catch dust and pollution, and roots soak up stormwater.

Canopy is often spread unevenly. Lower-income neighborhoods and communities of color tend to have far fewer trees, so they bake hotter in summer. That gap is what people mean by "tree equity." In Mecklenburg County the shade is concentrated in the wealthier southeast "wedge" while the lower-income "crescent" has far less, and more canopy is not automatically better in every spot — dense, walkable places may have less room for trees.

Two numbers circulate locally and they do not match. Mecklenburg County’s own high-resolution canopy analysis put countywide cover near 50% in 2023. The satellite measure mapped here reads closer to 39%, because it classifies 30-metre pixels rather than individual trees. Both show the same slow decline, and the satellite measure is the one that can be compared consistently across all 14 counties.`,
		resources: [
			{ title: 'American Forests — Tree Equity Score', url: 'https://www.treeequityscore.org/', note: 'Interactive map scoring how fairly tree canopy is shared across neighborhoods.' },
			{ title: 'U.S. EPA — Benefits of Trees and Vegetation', url: 'https://www.epa.gov/heatislands/benefits-trees-and-vegetation', note: 'How trees cool cities, clean the air, and ease the urban heat island.' },
			{ title: 'USDA Forest Service — i-Tree', url: 'https://www.itreetools.org/', note: 'Free tools that estimate the dollar value of benefits trees provide.' },
			{ title: 'TreesCharlotte', url: 'https://treescharlotte.org/', note: 'Local nonprofit tracking and restoring Mecklenburg’s declining tree canopy.' }
		]
	},
	'impervious-surface': {
		why: `**Impervious surface** is any hard, sealed surface that water cannot soak through: think roads, parking lots, driveways, sidewalks, and rooftops. The measure tracks the share of land covered by these surfaces. The more pavement and buildings an area has, the less ground is left to absorb rain.

This matters for two big reasons. First, hard surfaces store and radiate heat, so paved-over areas run hotter than green ones. Second, when rain hits pavement instead of soil, it rushes off quickly, picking up oil and chemicals and overwhelming storm drains.

That fast runoff is a leading cause of local flooding, stream erosion, and water pollution.`,
		resources: [
			{ title: 'U.S. EPA — Soak Up the Rain: What’s the Problem?', url: 'https://www.epa.gov/soakuptherain/soak-rain-whats-problem', note: 'How pavement and rooftops create polluted runoff and flooding, and what helps.' },
			{ title: 'USGS — Annual National Land Cover Database', url: 'https://www.usgs.gov/centers/eros/science/annual-national-land-cover-database', note: 'The federal data mapping percent impervious surface across the country.' },
			{ title: 'U.S. EPA — Reduce Heat Islands', url: 'https://www.epa.gov/green-infrastructure/reduce-heat-islands', note: 'How paved, built-up areas trap heat and how green infrastructure cools them.' }
		]
	},
	'forest-cover': {
		why: `**Forest cover** measures how much of the land is covered by trees and forest ecosystems. It is usually shown as a share of total land area, based on satellite images and on-the-ground surveys.

Forests do a lot of quiet work. They filter the air and drinking water, soak up rainfall to reduce flooding, and store carbon that would otherwise warm the climate. They also provide homes for most land animals and places for people to hike and relax. In a fast-growing region like Charlotte, forests near towns are especially valuable for shade and cooler temperatures.

Tracking forest cover over time shows whether an area is keeping its natural lands or losing them.`,
		resources: [
			{ title: 'USDA Forest Service — Forest Inventory and Analysis', url: 'https://research.fs.usda.gov/programs/fia', note: 'The nation’s official forest census, tracking how much forest exists and how it changes.' },
			{ title: 'U.S. EPA — Report on the Environment: Land Cover', url: 'https://cfpub.epa.gov/roe/indicator.cfm?i=49', note: 'National acreage of forest and other land types and recent change.' },
			{ title: 'The Nature Conservancy — How We Conserve Forests', url: 'https://www.nature.org/en-us/what-we-do/our-priorities/protect-water-and-land/land-and-water-stories/how-we-conserve-forests/', note: 'Why forests matter for wildlife, clean water, and storing carbon.' }
		]
	},
	'developed-land': {
		why: `**Developed land** is the share of land built up for human use: houses, roads, parking lots, stores, and the lawns, parks and roadside verges that come with them.

"Developed" is broader than "paved." It spans everything from dense downtown blocks to golf courses and front yards, so it runs well ahead of the share of ground that is actually sealed. In Mecklenburg County, more than two-thirds of the land counts as developed while under a quarter of the surface is impervious. The app maps impervious surface separately for that reason.

Some development is necessary and good, since it is where people live, work, and shop. But when developed land spreads quickly across a region, it can pave over forests, farms, and wildlife habitat.

Watching this share over time is the clearest way to see urban growth and sprawl. Mecklenburg has gone from a little over half developed to roughly two-thirds in two decades, while the region’s outer counties remain under a tenth developed — the same divide that shows up in traffic, lost green space, and pressure on natural areas.`,
		resources: [
			{ title: 'USGS — National Land Cover Database', url: 'https://www.usgs.gov/centers/eros/science/national-land-cover-database', note: 'The standard U.S. map of land cover, including the developed classes used here.' },
			{ title: 'USGS — Annual National Land Cover Database', url: 'https://www.usgs.gov/centers/eros/science/annual-national-land-cover-database', note: 'Yearly snapshots back to 1985 for seeing urban growth over time.' }
		]
	},
	farmland: {
		why: `**Farmland is the working land that grows food** — the share of an area’s land used for crops, pasture, and other farm production.

Farmland supports local food supply, farm jobs, and rural economies. It also shapes the look and character of a region. Once farmland is paved over for subdivisions, shopping centers, or roads, it almost never returns to growing food.

In fast-growing regions like Charlotte, sprawl is a leading cause of farmland loss. Watching this number over time shows whether a community is balancing new development with the open, working lands that feed people and filter rainwater.

The region still farms a great deal of its land, but not evenly, and not steadily. Union and Stanly counties remain substantially agricultural, while Mecklenburg’s farmland share has roughly halved since 2001 and is now the smallest in the region. The counties next in line for growth are where this number is worth watching.`,
		resources: [
			{ title: 'USDA — Census of Agriculture', url: 'https://www.nass.usda.gov/AgCensus/', note: 'The federal count of U.S. farms with land-use and acreage data down to the county.' },
			{ title: 'American Farmland Trust — Farms Under Threat', url: 'https://farmlandinfo.org/statistics/farms-under-threat/', note: 'Dashboard tracking farmland lost to development by state and county.' }
		]
	},
	wetlands: {
		why: `**Wetlands are areas where water covers the soil for much of the year**, such as marshes, swamps, and bogs. This measure shows what share of an area’s land is wetland.

Wetlands act like natural sponges. They soak up heavy rain and storm runoff, which lowers flooding for nearby homes and roads. They also clean water by trapping pollution and sediment before it reaches rivers and drinking-water supplies.

Wetlands are among the richest wildlife habitats anywhere. They have been drained and filled for farms and development for centuries, so tracking how much remains helps a community protect free flood control, cleaner water, and habitat that are hard and costly to replace.`,
		resources: [
			{ title: 'U.S. EPA — Why Are Wetlands Important?', url: 'https://www.epa.gov/wetlands/why-are-wetlands-important', note: 'How wetlands control floods, clean water, and support wildlife.' },
			{ title: 'U.S. Fish & Wildlife — National Wetlands Inventory', url: 'https://www.fws.gov/program/national-wetlands-inventory', note: 'The federal program that maps and tracks the nation’s wetlands.' }
		]
	},
	'light-pollution': {
		why: `**Light pollution is artificial light that spills into the night sky and washes out the stars.** Satellites measure how bright the night is over a place, which shows how much outdoor lighting from streetlights, signs, parking lots, and buildings is escaping upward. The most familiar form is "sky glow": the hazy dome of brightness over a city.

This matters for more than stargazing. Bright nights confuse wildlife: migrating birds veer off course and insects that pollinate plants die circling lights. For people, too much light at night can disrupt sleep and the body’s natural day-night rhythm.

Light pollution is also wasted money and energy. A large share of outdoor lighting shines uselessly into the sky.`,
		resources: [
			{ title: 'National Park Service — Light Pollution', url: 'https://www.nps.gov/subjects/nightskies/lightpollution.htm', note: 'Explains sky glow, glare, and light trespass and why a brightening sky harms ecosystems.' },
			{ title: 'NASA Earthdata — Nighttime Lights', url: 'https://www.earthdata.nasa.gov/topics/human-dimensions/nighttime-lights', note: 'How VIIRS satellites measure artificial light at night from space.' }
		]
	},

	// ---------------- Health ----------------
	// ACS-sourced health measures first, then the CDC PLACES model-based measures.
	// The PLACES no-trend caveat is carried by the manifest's `trendNote`, not restated here.
	obesity: {
		why: `**Obesity in adults** measures the share of adults whose weight, relative to their height, falls in a range linked to higher health risk, based on body mass index.

Obesity raises the risk of type 2 diabetes, heart disease, high blood pressure, and some cancers. It also drives higher medical costs.

Many causes are about access and environment, not personal willpower. The price and availability of healthy food, safe places to walk or play, work schedules, sleep, stress, and health care all play a role. Where rates are high, the conditions behind them are usually the better place to intervene.`,
		resources: [
			{ title: 'CDC — Adult Obesity Facts', url: 'https://www.cdc.gov/obesity/adult-obesity-facts/index.html', note: 'How common adult obesity is, related health conditions, and medical costs.' },
			{ title: 'County Health Rankings — Adult Obesity', url: 'https://www.countyhealthrankings.org/health-data/population-health-and-well-being/quality-of-life/physical-health/adult-obesity', note: 'The measure, why it matters, and the community conditions that shape it.' },
			{ title: 'Mecklenburg Community Health Assessment', url: 'https://health.mecknc.gov/population-health/cha', note: 'Mecklenburg’s own assessment of chronic disease and the neighborhood gaps behind it.' }
		]
	},
	diabetes: {
		why: `**Diabetes in adults** measures the share of adults who have been told by a health professional that they have diabetes, other than during pregnancy — a condition in which blood sugar stays too high. Most adult cases are type 2.

Diabetes matters because, left unmanaged, it can lead to heart disease, kidney failure, vision loss, and nerve damage, and it adds substantial cost to households and the health system.

These numbers reflect diagnosed cases, so they can undercount people who have diabetes but haven’t been tested. Access to care, affordable healthy food, and safe places to be active all influence who develops the condition and who gets treated for it.`,
		resources: [
			{ title: 'CDC — Diabetes Basics', url: 'https://www.cdc.gov/diabetes/about/index.html', note: 'What diabetes is, the main types, warning signs, and prevention.' },
			{ title: 'CDC PLACES — Compare counties', url: 'https://places.cdc.gov/', note: 'Interactive tool for model-based local estimates of diabetes and other measures.' },
			{ title: 'County Health Rankings — Diabetes Prevalence', url: 'https://www.countyhealthrankings.org/health-data/population-health-and-well-being/quality-of-life/physical-health/diabetes-prevalence', note: 'The diagnosed-diabetes measure, why it matters, and its limits.' }
		]
	},
	'frequent-mental-distress': {
		why: `**Frequent mental distress** measures the share of adults who said their mental health was not good for 14 or more days in the past month. Two weeks or more in a single month points to a serious, ongoing struggle rather than a passing bad day.

The reach is wide. Mental health shapes nearly every part of daily life: work, school, relationships, sleep, and physical health. Long stretches of distress are linked to chronic conditions and higher health care costs, and they often signal a need for support that isn’t being met.

Rates tend to be higher where people face money worries, isolation, or barriers to care — which makes this as much a measure of local conditions as of individual health.`,
		resources: [
			{ title: 'CDC PLACES — Health Status measure definitions', url: 'https://www.cdc.gov/places/measure-definitions/health-status.html', note: 'CDC’s official definition of frequent mental distress and how it is estimated.' },
			{ title: 'SAMHSA — Find Help and Treatment', url: 'https://www.samhsa.gov/find-help', note: 'Federal hub for the 988 crisis line and free, confidential treatment locators.' },
			{ title: 'Mecklenburg Community Health Assessment', url: 'https://health.mecknc.gov/population-health/cha', note: 'Local mental-health findings and the neighborhood gaps behind them.' }
		]
	},
	'no-health-insurance': {
		why: `**No health insurance** measures the share of working-age adults, ages 18 to 64, who currently have no health coverage. This age group is the focus because most children and older adults can get coverage through other programs, leaving working-age adults most exposed to gaps.

Coverage matters for both health and money. People without insurance are more likely to skip checkups, screenings, and needed treatment, which can let problems grow more serious. A single emergency can also lead to large bills and debt.

Uninsured rates tend to be higher among lower-income people and some racial and ethnic groups, so this measure reads as much as a map of access as of choice.`,
		resources: [
			{ title: 'KFF — Key Facts About the Uninsured Population', url: 'https://www.kff.org/uninsured/key-facts-about-the-uninsured-population/', note: 'Research fact sheet on who is uninsured, why, and the effects on care and costs.' },
			{ title: 'CDC PLACES — Prevention measure definitions', url: 'https://www.cdc.gov/places/measure-definitions/prevention.html', note: 'CDC’s official definition of the lack-of-insurance measure for adults 18–64.' },
			{ title: 'County Health Rankings — Uninsured', url: 'https://www.countyhealthrankings.org/health-data/health-factors/clinical-care/access-to-care/uninsured', note: 'Why coverage matters for care and finances, and its data source.' }
		]
	},
	'health-insurance': {
		why: `**Health insurance coverage** is the share of the civilian noninstitutionalized population, all ages, with any kind of coverage — through a job, a plan they bought, Medicaid, or Medicare.

People with coverage are more likely to see a doctor, fill prescriptions, and catch problems early, when they are cheaper and easier to treat. People without it often skip care, carry medical debt, or end up in the emergency room for issues that could have been prevented.

Coverage is not spread evenly: cost is the biggest barrier, and residents with lower incomes and some communities of color are more likely to be uninsured. Tracking coverage helps a community see who is being left out.

A major recent shift shapes how to read this map. North Carolina expanded Medicaid on December 1, 2023 to adults earning up to 138% of the federal poverty line, and more than 600,000 people enrolled in the first year — about twice as fast as the state had projected. The three South Carolina counties in this region (Chester, Lancaster, and York) are not covered, because South Carolina has not expanded Medicaid. Comparing coverage on either side of the state line is a contrast this two-state tool is uniquely able to show.`,
		resources: [
			{ title: 'U.S. Census Bureau — Health Insurance', url: 'https://www.census.gov/topics/health/health-insurance.html', note: 'The Census Bureau’s main hub for coverage data, tables, and reports.' },
			{ title: 'NC Medicaid — North Carolina Expands Medicaid', url: 'https://medicaid.ncdhhs.gov/north-carolina-expands-medicaid', note: 'Official details on the December 2023 expansion and who became newly eligible (NC only; SC has not expanded).' },
			{ title: 'U.S. Census Bureau — Small Area Health Insurance Estimates', url: 'https://www.census.gov/programs-surveys/sahie.html', note: 'Single-year uninsured estimates for every U.S. county.' },
			{ title: 'County Health Rankings — Access to Care', url: 'https://www.countyhealthrankings.org/health-data/health-factors/clinical-care/access-to-care', note: 'How insurance and provider access shape a community’s health.' }
		]
	},
	disability: {
		why: `**This measure shows the share of residents who report living with a disability.** The survey counts six broad types: difficulty with hearing, vision, thinking or remembering, walking or moving, self-care, and living independently. It is a measure of who is in the community and what they may need.

Disability is common. This is an all-ages measure covering the civilian noninstitutionalized population, and across this region about one in nine residents reports a disability — fewer in Mecklenburg County, more in the region’s rural counties. The share rises steeply with age, so it grows as a population gets older. (CDC’s widely cited "one in four" figure is higher because it counts adults only and uses a different definition, and children have much lower rates.)

Knowing this share helps a community plan. It signals demand for accessible sidewalks, buildings, transit, and housing, and for health and support services. People with disabilities often face extra barriers to care and higher costs.`,
		resources: [
			{ title: 'U.S. Census Bureau — Disability', url: 'https://www.census.gov/topics/health/disability.html', note: 'The Census Bureau’s main page for disability data and definitions.' },
			{ title: 'U.S. Census Bureau — Why We Ask: Disability', url: 'https://www.census.gov/acs/www/about/why-we-ask-each-question/disability/', note: 'The six disability questions and how communities use the results.' },
			{ title: 'CDC — Disability and Health Care Access', url: 'https://www.cdc.gov/disability-and-health/articles-documents/disabilities-health-care-access.html', note: 'How common disability is and the barriers to care people face.' }
		]
	},
	asthma: {
		why: `**Current asthma in adults** measures the share of adults who currently have asthma, a chronic condition that inflames and narrows the airways, causing wheezing, coughing, and trouble breathing.

Asthma is closely tied to the places people live. Mold, pests, dust, and secondhand smoke in older or poorly maintained housing can trigger attacks, and so can outdoor air pollution near busy roads and industry. That makes asthma a useful signal of environmental and housing conditions, not personal health alone.

Where rates are high, communities can target healthier housing, cleaner air, and reliable access to inhalers and primary care.`,
		resources: [
			{ title: 'CDC PLACES — Health Outcomes measure definitions', url: 'https://www.cdc.gov/places/measure-definitions/health-outcomes.html', note: 'Official definitions for chronic-disease measures like current asthma, and how they are estimated.' },
			{ title: 'CDC — About PLACES', url: 'https://www.cdc.gov/places/about/index.html', note: 'Explains the model-based small-area method behind the local estimates.' },
			{ title: 'Mecklenburg Community Health Assessment', url: 'https://health.mecknc.gov/population-health/cha', note: 'Local findings on respiratory health, housing quality, and air pollution.' }
		]
	},
	depression: {
		why: `**Depression in adults** measures the share of adults who have ever been told by a health professional that they have a depressive disorder. It is common and treatable, but often goes unaddressed.

Depression affects work, school, relationships, sleep, and physical health, and it raises the risk of other chronic conditions. Rates tend to be higher where people face money worries, isolation, chronic illness, or barriers to care.

Because this counts diagnosed cases, it can miss people who are struggling but have never been screened, so access to mental-health care shapes the number as much as underlying need. If you or someone you know needs help, the 988 Suicide & Crisis Lifeline offers free, confidential support.`,
		resources: [
			{ title: 'CDC PLACES — Health Outcomes measure definitions', url: 'https://www.cdc.gov/places/measure-definitions/health-outcomes.html', note: 'Official definition of the diagnosed-depression measure and how it is estimated.' },
			{ title: 'SAMHSA — Find Help and Treatment', url: 'https://www.samhsa.gov/find-help', note: 'Federal hub for the 988 crisis line and free, confidential treatment locators.' },
			{ title: 'Mecklenburg Community Health Assessment', url: 'https://health.mecknc.gov/population-health/cha', note: 'Local mental-health findings and where care is hardest to reach.' }
		]
	},
	'high-blood-pressure': {
		why: `**High blood pressure in adults** measures the share of adults ever told by a health professional that they have hypertension, a leading and often silent risk factor for heart disease, stroke, and kidney disease.

Because it usually has no symptoms, high blood pressure is frequently undiagnosed or untreated, especially where regular checkups are hard to reach. It is also highly manageable with consistent care, medication, and diet.

High rates often track other community conditions: limited access to care, healthy food, and safe places to be active. Reading this map next to the routine-checkup map shows where the gap is detection rather than disease.`,
		resources: [
			{ title: 'CDC PLACES — Health Outcomes measure definitions', url: 'https://www.cdc.gov/places/measure-definitions/health-outcomes.html', note: 'Official definition of the high-blood-pressure measure and how it is estimated.' },
			{ title: 'CDC — About PLACES', url: 'https://www.cdc.gov/places/about/index.html', note: 'Explains the model-based small-area method behind the local estimates.' },
			{ title: 'Mecklenburg Community Health Assessment', url: 'https://health.mecknc.gov/population-health/cha', note: 'Local cardiovascular-health findings and the neighborhood gaps behind them.' }
		]
	},
	smoking: {
		why: `**Current smoking in adults** measures the share of adults who currently smoke cigarettes.

Cigarette smoking remains the leading preventable cause of death in the U.S., raising the risk of cancer, heart disease, stroke, and lung disease. Rates have fallen for decades. But smoking now concentrates among lower-income residents and some other groups. That widens long-run health gaps.

High rates point to where tobacco prevention, quit support, and smoke-free housing can help most. Like other health behaviors, this reflects exposure, stress, and access to cessation help, not character.`,
		resources: [
			{ title: 'CDC PLACES — Health Risk Behaviors measure definitions', url: 'https://www.cdc.gov/places/measure-definitions/health-risk-behaviors.html', note: 'Official definition of the current-smoking measure and how it is estimated.' },
			{ title: 'CDC — About PLACES', url: 'https://www.cdc.gov/places/about/index.html', note: 'Explains the model-based small-area method behind the local estimates.' },
			{ title: 'Mecklenburg Community Health Assessment', url: 'https://health.mecknc.gov/population-health/cha', note: 'Local tobacco-use findings and the cessation programs available.' }
		]
	},
	'physical-inactivity': {
		why: `**No leisure-time physical activity** measures the share of adults who report getting no physical activity or exercise outside of their job in the past month.

Regular activity lowers the risk of obesity, diabetes, heart disease, and depression, so this measure is a useful window into chronic-disease risk. But it measures opportunity, not willpower. Safe sidewalks and parks, traffic, crime, work schedules, and caregiving all shape whether people can be active.

Where inactivity is high, investments in parks, greenways, safe streets, and recreation can pay off, especially in neighborhoods that have fewer of these amenities to begin with.`,
		resources: [
			{ title: 'CDC PLACES — Health Risk Behaviors measure definitions', url: 'https://www.cdc.gov/places/measure-definitions/health-risk-behaviors.html', note: 'Official definition of the no-leisure-time-physical-activity measure and how it is estimated.' },
			{ title: 'CDC — About PLACES', url: 'https://www.cdc.gov/places/about/index.html', note: 'Explains the model-based small-area method behind the local estimates.' },
			{ title: 'Mecklenburg Community Health Assessment', url: 'https://health.mecknc.gov/population-health/cha', note: 'Local findings on physical activity, parks, and greenway access.' }
		]
	},
	'fair-poor-health': {
		why: `**Fair or poor health** measures the share of adults who rate their own general health as "fair" or "poor" rather than good, very good, or excellent. This simple self-rating is a remarkably strong predictor of future illness, health-care use, and even life span.

Because it sums up how people actually feel, this measure captures the combined weight of chronic conditions, mental health, stress, and living conditions in a single number.

High rates flag communities carrying a heavy health burden, and they often map onto economic hardship and barriers to care. Start here, then look at single conditions.`,
		resources: [
			{ title: 'CDC PLACES — Health Status measure definitions', url: 'https://www.cdc.gov/places/measure-definitions/health-status.html', note: 'CDC’s definition of self-rated fair-or-poor health and how it is estimated.' },
			{ title: 'CDC — About PLACES', url: 'https://www.cdc.gov/places/about/index.html', note: 'Explains the model-based small-area method behind the local estimates.' },
			{ title: 'Mecklenburg Community Health Assessment', url: 'https://health.mecknc.gov/population-health/cha', note: 'Local self-reported health findings and how they vary by neighborhood.' }
		]
	},
	'routine-checkup': {
		why: `**Routine checkup** measures the share of adults who had a routine checkup with a doctor in the past year. It is a basic gauge of whether people can reach and afford regular preventive care.

Regular checkups catch problems like high blood pressure, diabetes, and cancer early, when they are easier and cheaper to treat. Catching them later costs more. Higher rates generally mean residents have a usual source of care and can get to it; lower rates can signal cost, insurance, transportation, or provider-supply barriers.

Reading this alongside insurance coverage and transportation barriers helps show where preventive care is within reach and where it is not.`,
		resources: [
			{ title: 'CDC PLACES — Prevention measure definitions', url: 'https://www.cdc.gov/places/measure-definitions/prevention.html', note: 'Official definition of the routine-checkup measure and how it is estimated.' },
			{ title: 'CDC — About PLACES', url: 'https://www.cdc.gov/places/about/index.html', note: 'Explains the model-based small-area method behind the local estimates.' },
			{ title: 'Mecklenburg Community Health Assessment', url: 'https://health.mecknc.gov/population-health/cha', note: 'Local findings on access to primary care and preventive services.' }
		]
	},
	'food-insecurity': {
		why: `**Food insecurity** measures the share of adults who, in the past year, did not always have reliable access to enough affordable, nutritious food.

Going without steady, healthy food is a core driver of poor health, linked to diabetes, heart disease, poor mental health, and worse outcomes for children. It usually reflects the squeeze between low incomes and the cost of food, housing, and other basics.

In Charlotte, food insecurity overlaps with food deserts, a related but separate measure. About 15% of Mecklenburg residents live in a low-supermarket-access area by the USDA’s definition, above both the state and national figures. Those areas concentrate along the West Boulevard, Beatties Ford Road, and Freedom Drive corridors. Community responses include the resident-owned Three Sisters Market co-op.`,
		resources: [
			{ title: 'CDC PLACES — Health-Related Social Needs measure definitions', url: 'https://www.cdc.gov/places/measure-definitions/health-related-social-needs.html', note: 'Official definition of the food-insecurity measure and how it is estimated.' },
			{ title: 'WFAE — How Charlotte is trying to address food deserts', url: 'https://www.wfae.org/race-equity/2023-11-09/fried-processed-everything-but-healthy-how-charlotte-is-trying-to-address-food-deserts', note: 'Local reporting on food deserts along the West Boulevard, Beatties Ford, and Freedom Drive corridors.' },
			{ title: 'Mecklenburg Community Health Assessment', url: 'https://health.mecknc.gov/population-health/cha', note: 'Local data on food access and where healthy food is hardest to reach.' }
		]
	},
	'housing-insecurity': {
		why: `**Housing insecurity** measures the share of adults who, in the past year, experienced unstable housing, such as worrying about or struggling to pay rent, moving often, or facing eviction.

Unstable housing harms health and child development directly, through stress, disrupted schooling and care, and frequent moves. It is the lived-experience companion to rent burden and eviction: what cost pressure feels like in daily life.

Charlotte is a national example of this strain. Roughly 46,000 eviction cases were filed in Mecklenburg County in 2024, a rise of about 37% in a single year, and development along the LYNX Blue Line corridor has added displacement pressure in the neighborhoods closest to it.`,
		resources: [
			{ title: 'CDC PLACES — Health-Related Social Needs measure definitions', url: 'https://www.cdc.gov/places/measure-definitions/health-related-social-needs.html', note: 'Official definition of the housing-insecurity measure and how it is estimated.' },
			{ title: 'Princeton Eviction Lab', url: 'https://evictionlab.org/', note: 'National eviction data and rankings; Charlotte ranks among the highest-filing large cities.' },
			{ title: 'Mecklenburg Housing Data', url: 'https://mecklenburghousingdata.org/', note: 'Local dashboards on eviction filings, the affordable-housing gap, and housing instability.' }
		]
	},
	'transportation-barriers': {
		why: `**Transportation barriers** measures the share of adults who, in the past year, lacked reliable transportation to get to work, medical appointments, the grocery store, or daily errands.

When getting around is unreliable, people miss medical care, job shifts, and chances to buy fresh food, so this measure ties directly to health, employment, and food access. It complements the share of households with no vehicle, capturing people who may have a car that is unreliable or who depend on limited transit.

That distinction is the useful one here. A household can own a car and still be stranded by it. So this map and the no-vehicle map do not line up exactly, and the gap between them is worth a look.`,
		resources: [
			{ title: 'CDC PLACES — Health-Related Social Needs measure definitions', url: 'https://www.cdc.gov/places/measure-definitions/health-related-social-needs.html', note: 'Official definition of the lack-of-reliable-transportation measure and how it is estimated.' },
			{ title: 'Urban Institute — Transportation Access and Upward Mobility', url: 'https://upward-mobility.urban.org/framework/neighborhoods/transportation', note: 'How transportation access shapes reaching jobs, schools, and health care.' },
			{ title: 'Mecklenburg Community Health Assessment', url: 'https://health.mecknc.gov/population-health/cha', note: 'Local findings on transportation as a barrier to care.' }
		]
	},
	'social-emotional-support': {
		why: `**Lack of social and emotional support** measures the share of adults who say they rarely or never get the social and emotional support they need.

Strong social connections are a powerful determinant of health. The U.S. Surgeon General’s 2023 advisory placed social connection alongside risks like smoking and obesity, noting that people without enough support face higher risks of depression, chronic disease, and early death, and may struggle more during illness, job loss, or other hard times.

High rates can signal social isolation and weaker community ties, pointing to where programs that build connection (for new parents, older adults, caregivers, and newcomers) can help most.`,
		resources: [
			{ title: 'CDC PLACES — Health-Related Social Needs measure definitions', url: 'https://www.cdc.gov/places/measure-definitions/health-related-social-needs.html', note: 'Official definition of the lack-of-social-and-emotional-support measure and how it is estimated.' },
			{ title: 'U.S. Surgeon General — Our Epidemic of Loneliness and Isolation', url: 'https://www.hhs.gov/surgeongeneral/priorities/connection/index.html', note: 'The 2023 federal advisory on social connection as a public-health priority.' },
			{ title: 'Mecklenburg Community Health Assessment', url: 'https://health.mecknc.gov/population-health/cha', note: 'Local findings on social support and community connection.' }
		]
	},
	loneliness: {
		why: `**Loneliness** measures the share of adults who report feeling lonely. Once treated as a private feeling, loneliness is now recognized as a public-health priority.

Persistent loneliness is linked to higher risks of heart disease, stroke, dementia, depression, and premature death. It can affect anyone, but it tends to be higher among older adults living alone, caregivers, people in poor health, and those who are socially isolated.

Where loneliness runs high, libraries, senior centers, faith groups, and neighborhood programs are the institutions positioned to rebuild connection.`,
		resources: [
			{ title: 'CDC PLACES — Health-Related Social Needs measure definitions', url: 'https://www.cdc.gov/places/measure-definitions/health-related-social-needs.html', note: 'Official definition of the loneliness measure and how it is estimated.' },
			{ title: 'U.S. Surgeon General — Our Epidemic of Loneliness and Isolation', url: 'https://www.hhs.gov/surgeongeneral/priorities/connection/index.html', note: 'Federal advisory on the health risks of loneliness and how to rebuild connection.' },
			{ title: 'Mecklenburg Community Health Assessment', url: 'https://health.mecknc.gov/population-health/cha', note: 'Local findings on isolation and social connection.' }
		]
	},

	// ---------------- Housing ----------------
	'owner-occupied': {
		why: `**Owner-occupied housing** is the share of lived-in homes occupied by their owners rather than rented. A higher rate often points to neighborhood stability, since owners tend to stay longer and have a financial stake in the community.

Homeownership is also one of the main ways families build equity over time, money they can pass on or borrow against. But access to ownership has not been equal, and large, long-standing gaps remain between racial and ethnic groups. In Charlotte, narrowing that gap is an explicit goal. The two main local tools are the city’s Housing Trust Fund and the privately financed Housing Opportunity Investment Fund. Voters have replenished the Trust Fund through a series of bonds that grew from $15 million in 2014 to $125 million in 2026.

A low owner-occupied share is not automatically a problem. Lively neighborhoods can have many renters, and cost and rent figures tell more about who can afford to put down roots.`,
		resources: [
			{ title: 'U.S. Census Bureau — Why We Ask: Ownership', url: 'https://www.census.gov/acs/www/about/why-we-ask-each-question/ownership/', note: 'How home ownership (tenure) is measured and why the data matter.' },
			{ title: 'U.S. Census Bureau — Housing Vacancies and Homeownership', url: 'https://www.census.gov/housing/hvs/', note: 'Official source for U.S. homeownership and vacancy rate trends.' },
			{ title: 'Urban Institute — Reducing the Racial Homeownership Gap', url: 'https://www.urban.org/policy-centers/housing-finance-policy-center/projects/reducing-racial-homeownership-gap', note: 'Research on how ownership builds wealth and why gaps persist.' }
		]
	},
	'rent-burden': {
		why: `**Cost burden means paying 30% or more of household income on housing.** This measure counts the share of renter households (those whose rent-to-income ratio can be computed) that cross that line. When rent eats up a third or more of a paycheck, there is less left for food, child care, transportation, savings, and emergencies.

A higher share signals greater need and financial strain. Cost-burdened renters are more likely to fall behind, move often, or face eviction. Households spending more than half their income on rent are considered severely burdened.

In recent years, rent burden has climbed to record levels nationwide, reaching well beyond the lowest-income renters. Tracking it locally shows where affordable rental housing is falling short.

Charlotte makes the stakes concrete. Mecklenburg County is short roughly 23,000 rental units affordable to households at or below 30% of area median income, the widest gap of any income level. It also lost about 36,000 low-cost rentals between 2015 and 2020. Roughly 46,000 eviction cases were filed in 2024, up about 37% in a single year. Charlotte voters have responded with a growing series of Housing Trust Fund bonds, reaching $125 million in 2026, the largest in the city’s history.`,
		resources: [
			{ title: 'U.S. Census Bureau — Nearly half of renters are cost-burdened', url: 'https://www.census.gov/newsroom/press-releases/2024/renter-households-cost-burdened-race.html', note: 'About half of U.S. renters pay 30%+ of income on housing, with breakdowns.' },
			{ title: 'Mecklenburg Housing Data', url: 'https://mecklenburghousingdata.org/', note: 'Local dashboard tracking eviction filings, the affordable-housing gap, and instability.' },
			{ title: 'U.S. Census Bureau — Housing data hub', url: 'https://www.census.gov/topics/housing.html', note: 'Central portal for rent, home value, and housing cost data.' }
		]
	},
	'owner-cost-burden': {
		why: `**Owner cost burden** is the share of owner households whose housing costs reach 30% or more of their income (counting owners whose cost-to-income ratio can be computed). Cost burden is not only a renter’s problem. For owners those costs include the mortgage, property taxes, insurance, and utilities, not just the loan payment.

A higher share means more homeowners are stretched thin. That can make it harder to keep up with maintenance, handle a job loss or medical bill, or hold onto the home during tough times. Severe burden (paying more than half of income on housing) raises the risk of losing the home.`,
		resources: [
			{ title: 'U.S. Census Bureau — Why We Ask: Ownership', url: 'https://www.census.gov/acs/www/about/why-we-ask-each-question/ownership/', note: 'The homeowner cost measures (mortgage, taxes, insurance, utilities) behind cost burden.' },
			{ title: 'U.S. Census Bureau — Housing data hub', url: 'https://www.census.gov/topics/housing.html', note: 'Gateway to housing cost, mortgage, and affordability statistics.' }
		]
	},
	'vacant-homes': {
		why: `**A vacant home is one with no one living in it.** This measure shows the share of all housing units that are empty. It is a context number, not automatically good or bad, because vacancy has many causes.

Some empty units are for sale or for rent and simply between residents, a normal sign of a moving market. Others are seasonal or vacation homes, the single largest type of vacant housing nationwide. But a high vacancy rate can also flag disinvestment, where homes sit empty because of job losses, foreclosures, or neglect.

Vacancy rarely means one thing. Because the reasons differ so much, it helps to read this number alongside local knowledge.`,
		resources: [
			{ title: 'U.S. Census Bureau — Most vacant housing is seasonal', url: 'https://www.census.gov/library/stories/2023/05/vacant-seasonal-housing.html', note: 'Shows seasonal/recreational use is the largest category of vacant homes.' },
			{ title: 'U.S. Census Bureau — Housing Vacancies and Homeownership', url: 'https://www.census.gov/housing/hvs/', note: 'Official source for vacancy rates and characteristics.' }
		]
	},
	'occupied-homes': {
		why: `**An occupied home is one where people live.** This measure shows the share of all housing units that are someone’s residence, the flip side of the vacancy rate. Together they account for every housing unit in an area.

The useful reading is about supply. Where occupancy runs high, almost the whole housing stock is in use and there is little slack for people trying to move. That tends to push rents and prices up. Where occupancy is lower, that can mean a market with room in it, or a place with many seasonal and second homes. Neither is good or bad on its own.`,
		resources: [
			{ title: 'U.S. Census Bureau — Housing data hub', url: 'https://www.census.gov/topics/housing.html', note: 'Census portal covering occupancy, vacancy, and the size and type of homes.' },
			{ title: 'U.S. Census Bureau — Housing Vacancies and Homeownership', url: 'https://www.census.gov/housing/hvs/', note: 'Data on occupied and vacant units and how occupancy is defined.' }
		]
	},
	'new-homes': {
		why: `**This measure shows where new construction is happening.** It is the share of homes built in 2010 or later. This is a fixed cutoff tied to a construction year, not a rolling "last 10 years," so the same vintage line stays put as time passes. A high share points to places that have added a lot of housing since 2010.

New construction matters because adding homes can ease housing shortages and help keep prices and rents in check when demand is rising. It also shapes neighborhoods, schools, roads, and local services that have to keep pace with growth.

A low share is not a problem by itself. Many established, desirable areas have older housing. Reading this across the region shows which communities are expanding quickly and which are largely built out.

In Charlotte, where new housing has gone is as telling as how much. Nearly $1 billion in new development has gone up within about a quarter-mile of the LYNX Blue Line since 2013, roughly two-thirds of it apartments, alongside 331 demolitions of mostly older houses. The study that documents all this is careful about what it cannot say: how much of that building would have happened without the rail line. The same corridor has raised concerns about displacing longtime, lower-income residents.`,
		resources: [
			{ title: 'U.S. Census Bureau — Why We Ask: Year Built', url: 'https://www.census.gov/acs/www/about/why-we-ask-each-question/year-built/', note: 'The year-built question used to gauge housing age and where newer homes are.' },
			{ title: 'UNC Charlotte Urban Institute — How the Blue Line Extension changed development', url: 'https://ui.charlotte.edu/story/part-1-how-blue-line-extension-changed-charlotte-development/', note: 'Maps construction and demolition along the light-rail corridor, and says plainly what the data cannot show.' },
			{ title: 'U.S. Census Bureau — Characteristics of New Housing', url: 'https://www.census.gov/construction/chars/', note: 'National data on newly built homes, including size, features, and prices.' }
		]
	},
	'average-household-size': {
		why: `**This is the average number of people living in each home.** It captures how many residents, on average, share a household, which shapes how much housing a community needs.

The number matters because housing demand is driven by households, not just total population. When average size falls, a place can need more homes even if its population barely grows. Over the long run, U.S. household size has slowly declined as more people live alone or have smaller families.

A larger average size can reflect bigger or multigenerational families, and in tight markets it can also signal crowding, where more people share each home because housing is scarce or costly.`,
		resources: [
			{ title: 'U.S. Census Bureau — Interpreting Average Household Size', url: 'https://www.census.gov/library/fact-sheets/2024/dec/calculating-interpreting-avg-hh-size.html', note: 'How average household size is figured and what it means.' },
			{ title: 'U.S. Census Bureau — Housing data hub', url: 'https://www.census.gov/topics/housing.html', note: 'Gateway to data on households, home size, and housing demand.' }
		]
	},

	// ---------------- Transportation ----------------
	'no-vehicle': {
		why: `**A household with no vehicle available** has fewer ways to reach work, school, care and groceries. In a region built mostly around driving, these families depend on buses, walking, biking, or rides from others.

When those options are limited or slow, people can be cut off from jobs and services that car owners reach easily. A car is also expensive to buy, insure, and maintain, so going without one can reflect cost pressures as much as choice.

Tracking this helps show where reliable, affordable transit, sidewalks, and bike routes matter most. In Charlotte the geography makes it concrete. For a household without a car in the crescent, reaching jobs in the southeast wedge or the airport-area warehouses can mean long, multi-transfer trips. The LYNX Blue Line widened transit access, but only along its own corridor.`,
		resources: [
			{ title: 'U.S. Census Bureau — Commuting (Journey to Work)', url: 'https://www.census.gov/topics/employment/commuting.html', note: 'Official hub for commuting data, including vehicles available to households.' },
			{ title: 'Urban Institute — Transportation Access and Upward Mobility', url: 'https://upward-mobility.urban.org/framework/neighborhoods/transportation', note: 'How transportation access shapes reaching jobs, schools, and health care.' },
			{ title: 'Urban Institute — The Unequal Commute', url: 'https://www.urban.org/features/unequal-commute', note: 'How gaps in car access and transit fall unevenly across neighborhoods.' }
		]
	},
	'long-commute': {
		why: `**A long trip to work eats into time, money, and well-being.** This measure shows the share of workers whose one-way commute is 20 minutes or more, a sense of how many people face a meaningful daily drive or ride rather than a quick hop across town.

Longer commutes mean more fuel and wear on a vehicle and more hours away from family, and they are associated with more stress and worse health. They also point to a mismatch between where homes are affordable and where jobs are located.

Watching this share over time can reveal whether growth, housing costs, and road or transit investments are making the daily trip easier or harder.

In this region the longest commutes are not in Charlotte. The highest shares sit in the outer counties — Chester and Lancaster in South Carolina, and Union to the east — where affordable housing has grown faster than nearby employment, so residents drive toward the metro core. The share has crept upward region-wide over the past decade. That is what a housing-and-jobs mismatch looks like as it widens.`,
		resources: [
			{ title: 'U.S. Census Bureau — Why We Ask About Commuting', url: 'https://www.census.gov/acs/www/about/why-we-ask-each-question/commuting/', note: 'How commute-time data is collected and used, including links to health.' },
			{ title: 'Urban Institute — The Unequal Commute', url: 'https://www.urban.org/features/unequal-commute', note: 'How long commutes burden lower-wage and transit-dependent workers most.' }
		]
	},
	'drove-alone': {
		why: `**Most local trips to work are still one person, one car.** This measure shows the share of workers who commute by driving alone, rather than carpooling, taking transit, walking, biking, or working from home.

When nearly everyone drives solo, roads fill up faster, congestion grows, and parking demand rises. Driving alone is also the most carbon-heavy way to commute: transportation is the largest source of U.S. greenhouse gas emissions, and everyday car travel is a big part of that. For households, fuel, insurance, and upkeep add up.

A high share is not a judgment of drivers. It often reflects limited alternatives.`,
		resources: [
			{ title: 'U.S. EPA — Fast Facts on Transportation Emissions', url: 'https://www.epa.gov/greenvehicles/fast-facts-transportation-greenhouse-gas-emissions', note: 'Transportation is the largest U.S. emissions source, led by everyday cars.' },
			{ title: 'U.S. Census Bureau — Commuting (Journey to Work)', url: 'https://www.census.gov/topics/employment/commuting.html', note: 'Official source for how workers get to work, including driving alone.' }
		]
	},
	'mean-travel-time': {
		why: `**The average commute is a quick pulse-check on daily life.** This measure is the typical one-way travel time to work, in minutes. Because it averages everyone’s trip, it is a simple way to compare places and watch whether commutes are getting longer or shorter over time.

When the average climbs, it usually signals heavier traffic, longer distances between affordable homes and jobs, or transit that is not keeping pace with growth. Longer trips mean more time lost each week, higher costs, and added strain on roads and the air.

For a fast-growing region, this number is an early warning light, and it connects to Charlotte’s mobility debate. The 2014 study that ranked Charlotte last among large metros for upward mobility also found mobility higher in less sprawling metros, measured partly by commute times. That was a secondary finding, not one of its five headline factors. The region took it seriously anyway, and the LYNX Blue Line was its signature bet on shortening trips and linking neighborhoods to jobs.`,
		resources: [
			{ title: 'U.S. Census Bureau — Why We Ask About Commuting', url: 'https://www.census.gov/acs/www/about/why-we-ask-each-question/commuting/', note: 'How mean travel time to work is collected and used for planning.' },
			{ title: 'Opportunity Insights — Where is the Land of Opportunity?', url: 'https://opportunityinsights.org/paper/land-of-opportunity/', note: 'The 2014 mobility study, its five strongest correlates, and its sprawl and commute-time findings.' },
			{ title: 'Urban Institute — Transportation Access and Upward Mobility', url: 'https://upward-mobility.urban.org/framework/neighborhoods/transportation', note: 'Connects commute times and transit access to reaching opportunity.' }
		]
	}
};
