/**
 * Plain-language "why this matters" briefs for each indicator, with cited, verified resources.
 * Written for residents, journalists, and community advocates (non-academic). Keyed by indicator slug.
 * `why` is markdown (paragraphs + bold); `resources` are real, authoritative, verified links.
 *
 * Maintained as editorial content in the app repo (independent of the data pipeline).
 */
export const indicatorBriefs = {
	// ---------------- Character (general demographics) ----------------
	'total-population': {
		why: `**Total population is the headcount of an area** — how many people live there. It is the starting point for almost every other statistic, because counts like the number of children, seniors, or residents of a given background only make sense against the total. A "share" or a "rate" needs this denominator to mean anything.

Accurate population counts shape daily life. They guide how many seats a community gets in Congress and the state legislature, and they steer billions in federal funding for schools, roads, health clinics, and emergency services. Planners use them to decide where to build a new fire station, bus route, or library.

Population also reveals change over time. A county that is growing quickly faces different pressures — housing, traffic, school capacity — than one that is shrinking. Watching the total helps a community prepare rather than react.`,
		resources: [
			{ title: 'U.S. Census Bureau — Population & Housing Unit Estimates', url: 'https://www.census.gov/programs-surveys/popest.html', note: 'Official annual population totals for the nation, states, counties, and cities.' },
			{ title: 'U.S. Census Bureau — Population topic page', url: 'https://www.census.gov/topics/population.html', note: 'Hub linking to population data, methods, and how counts drive funding and representation.' }
		]
	},
	'population-density': {
		why: `**Population density measures how crowded an area is** — the number of residents divided by its land area, usually shown as people per square mile. It captures the physical shape of a community: dense downtowns and apartment districts sit at the high end, while spread-out suburbs and rural farmland sit at the low end.

Density matters because it shapes what services make sense. Frequent bus service, sidewalks, and water and sewer lines are easier to justify where people live close together. In low-density areas, residents often rely on cars and wells, and services cost more per person to deliver.

Density is most meaningful for small areas like neighborhoods; a county-wide average can hide the difference between a packed urban core and empty open land.`,
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
		why: `**This measure shows the share of residents who are non-Hispanic White** — people who identify as White and not Hispanic or Latino. Like all race and ethnicity counts, it reflects how people describe themselves on the census, not a biological category. It is one piece of a community's overall makeup.

Tracking this share helps communities understand diversity and how it is changing. Nationally, the non-Hispanic White share has been gradually declining as other groups grow, and that pattern looks different from place to place.

The figure matters most alongside the others. Comparing group shares over time is how researchers study segregation, fair access to housing and services, and whether public institutions reflect the people they serve. No share is good or bad on its own — it is context for equity and planning.`,
		resources: [
			{ title: 'U.S. Census Bureau — Why We Ask: Race', url: 'https://www.census.gov/acs/www/about/why-we-ask-each-question/race/', note: 'Explains how race is self-reported and how the data support civil rights and planning.' },
			{ title: 'Brookings — The nation is diversifying even faster than predicted', url: 'https://www.brookings.edu/articles/new-census-data-shows-the-nation-is-diversifying-even-faster-than-predicted/', note: 'Analysis of long-run trends in the White population share and growing U.S. diversity.' }
		]
	},
	'black-residents': {
		why: `**This measure shows the share of residents who are Black or African American.** Like other race counts, it is based on how people identify themselves, and it reflects a diverse community that includes people with long U.S. roots as well as more recent immigrants from Africa, the Caribbean, and elsewhere.

This share matters for understanding a community's history and present. In the Charlotte region and across the South, where most Black Americans live, these patterns are tied to decades of housing, schooling, and economic policy. Tracking the share helps reveal where opportunity and investment have or have not reached.

The data also support fairness. They are used to enforce voting rights and fair-housing laws, to plan services, and to study segregation and equity.`,
		resources: [
			{ title: 'Pew Research Center — Facts about the U.S. Black population', url: 'https://www.pewresearch.org/race-and-ethnicity/fact-sheet/facts-about-the-us-black-population/', note: 'Demographic profile covering size, growth, geography, and diversity within the population.' },
			{ title: 'U.S. Census Bureau — Why We Ask: Race', url: 'https://www.census.gov/acs/www/about/why-we-ask-each-question/race/', note: 'How race data are collected and used to enforce civil rights and allocate services.' }
		]
	},
	'hispanic-residents': {
		why: `**This measure shows the share of residents who are Hispanic or Latino** — people of Cuban, Mexican, Puerto Rican, Central or South American, or other Spanish-speaking heritage. The Census treats this as an ethnicity, separate from race, so Hispanic residents may be of any race. People report it themselves.

This share helps communities plan and serve everyone well. It informs decisions about bilingual services, schools, health outreach, and where to locate facilities. In many parts of the Charlotte region, the Hispanic population has grown quickly, reshaping neighborhoods, businesses, and classrooms.

The data also support fair treatment — upholding voting rights, including language assistance at the polls, and studying whether public programs reach Hispanic residents equitably.`,
		resources: [
			{ title: 'U.S. Census Bureau — Why We Ask: Hispanic or Latino Origin', url: 'https://www.census.gov/acs/www/about/why-we-ask-each-question/ethnicity/', note: 'Explains the Hispanic-origin question, why it is separate from race, and how data are used.' },
			{ title: 'U.S. Census Bureau — 2020 Census: a more diverse nation', url: 'https://www.census.gov/library/stories/2021/08/2020-united-states-population-more-racially-ethnically-diverse-than-2010.html', note: 'Shows the Hispanic population’s growth and role in national diversity, with state comparisons.' }
		]
	},
	'asian-residents': {
		why: `**This measure shows the share of residents who are Asian** — a broad, self-identified category spanning more than two dozen origin groups with roots in East, South, Southeast, and Central Asia, each with its own language, culture, and history. A single number summarizes a very diverse population.

This share helps communities plan inclusively. It can inform language access, cultural programming, small-business support, and health outreach. The Asian population is among the fastest-growing in the country, and in fast-growing metros like Charlotte that growth can reshape neighborhoods and schools.

Because the category covers so many distinct communities, the share is best read as a starting point, not the full story.`,
		resources: [
			{ title: 'Pew Research Center — Asian Americans in the U.S.', url: 'https://www.pewresearch.org/race-and-ethnicity/fact-sheet/asian-americans-in-the-u-s/', note: 'Profile of the Asian population’s size, rapid growth, origin groups, and geography.' },
			{ title: 'U.S. Census Bureau — Why We Ask: Race', url: 'https://www.census.gov/acs/www/about/why-we-ask-each-question/race/', note: 'Explains how the Asian category is reported and how race data guide services.' }
		]
	},
	'other-race-residents': {
		why: `**This measure groups residents who are another race or who identify with two or more races.** It captures people whose backgrounds do not fit a single standard category, including a fast-growing multiracial population. As with all race data, it reflects how people choose to describe themselves.

This group has grown sharply, and it skews young — multiracial residents have one of the lowest median ages of any group. Part of the recent jump also comes from improvements in how the Census collects and codes answers, so comparisons across years should be made with care.

Tracking this share helps communities recognize a more complex, blended population and supports inclusive planning and fair representation.`,
		resources: [
			{ title: 'U.S. Census Bureau — A third reporting two or more races were under 18', url: 'https://www.census.gov/library/stories/2023/06/nearly-a-third-reporting-two-or-more-races-under-18-in-2020.html', note: 'Examines the youthful, fast-growing multiracial population and data-processing changes.' },
			{ title: 'U.S. Census Bureau — 2020 Census: a more diverse nation', url: 'https://www.census.gov/library/stories/2021/08/2020-united-states-population-more-racially-ethnically-diverse-than-2010.html', note: 'Context on rising diversity and how multiple-race responses are measured.' }
		]
	},
	'foreign-born': {
		why: `**Foreign-born residents** are people who were born in another country and now live here. The group includes naturalized U.S. citizens, green-card holders, students, workers, and others. It is simply a measure of where people were born, not their current legal status.

Knowing how many residents are foreign-born helps a community plan well. Newcomers may need help learning English, getting professional licenses recognized, or finding their way around local services. Schools, clinics, and libraries can tailor programs when they understand who lives nearby.

Immigrant residents also strengthen a region. They start businesses, fill jobs, and add to the cultural life of a place.`,
		resources: [
			{ title: 'U.S. Census Bureau — About the Foreign-Born Population', url: 'https://www.census.gov/topics/population/foreign-born/about.html', note: 'Definitions and overview of who is counted as foreign-born and how the data are collected.' },
			{ title: 'Pew Research Center — Key findings about U.S. immigrants', url: 'https://www.pewresearch.org/short-reads/2025/08/21/key-findings-about-us-immigrants/', note: 'Plain-language roundup of national data on the size, origins, and traits of immigrants.' }
		]
	},
	'limited-english-households': {
		why: `**A limited-English-speaking household** is one where no member age 14 or older speaks English "very well." These households may speak another language at home and still manage daily life, but they can struggle when key information comes only in English.

This measure matters for safety and fairness. During emergencies like storms or evacuations, instructions must reach everyone quickly. The same is true for health notices, court papers, school forms, and voting materials. When a community knows where language needs are highest, it can offer interpreters, translated documents, and bilingual staff.

This is about access, not ability — many residents in these households are working, raising families, and contributing fully.`,
		resources: [
			{ title: 'U.S. Census Bureau — About Language Use', url: 'https://www.census.gov/topics/population/language-use/about.html', note: 'How the Census defines and measures limited-English-speaking households.' },
			{ title: 'U.S. Census Bureau — Why We Ask About Language', url: 'https://www.census.gov/acs/www/about/why-we-ask-each-question/language/', note: 'How agencies use language data to plan services and reach non-English speakers.' }
		]
	},
	youth: {
		why: `**Youth** are residents under age 18. This share tells a community how many children and teens it is raising, and it shapes demand for many everyday services.

A larger young population means more need for schools, classrooms, and teachers, plus childcare, after-school programs, pediatric care, parks, and playgrounds. Planners use this number to decide where to build schools, how to route buses, and where families with kids are clustered.

The share of youth also signals a community's future. Children today are tomorrow's workers, voters, and neighbors.`,
		resources: [
			{ title: 'U.S. Census Bureau — About the Child Population', url: 'https://www.census.gov/topics/population/children/about.html', note: 'Overview of how the Census measures the under-18 population.' },
			{ title: 'U.S. Census Bureau — Older adults outnumber children in 11 states', url: 'https://www.census.gov/newsroom/press-releases/2025/older-adults-outnumber-children.html', note: 'Recent data story comparing the youth and older-adult shares across places.' }
		]
	},
	'older-adults': {
		why: `**Older adults** are residents age 65 and older. Thanks to longer lives and the large baby-boom generation, this group is growing quickly across the country, making it one of the most important numbers for local planning.

More older adults means more demand for healthcare, home services, and accessible transit for people who no longer drive. It also shapes housing, since many seniors want to stay in their own homes and communities as they age.

Older residents are also active contributors — they volunteer, work, care for grandchildren, and anchor neighborhoods. Tracking this share helps a community build age-friendly places.`,
		resources: [
			{ title: 'ACL — Profile of Older Americans', url: 'https://acl.gov/aging-and-disability-in-america/data-and-research/profile-older-americans', note: 'Annual federal summary of demographics, income, and health for adults 65+.' },
			{ title: 'Population Reference Bureau — Aging in the United States', url: 'https://www.prb.org/resource/fact-sheet-aging-in-the-united-states/', note: 'Accessible fact sheet on the growth and characteristics of the older population.' },
			{ title: 'AARP Livability Index', url: 'https://livabilityindex.aarp.org/', note: 'Interactive tool scoring how well communities support residents of all ages.' }
		]
	},
	'households-with-children': {
		why: `**Households with children** are homes where at least one child under 18 lives. This counts families rather than individual kids, which gives a clearer picture of how many homes are raising the next generation.

This measure shapes the services families rely on most. Areas with many such households need good schools, childcare, pediatric care, parks, and family-sized housing. It also helps target programs like school meals and family support, and guides decisions about library hours, bus routes, and recreation.

The share also reflects a community's character and direction — neighborhoods full of young families have different needs than those with mostly adults living alone.`,
		resources: [
			{ title: 'U.S. Census Bureau — Families and Households', url: 'https://www.census.gov/topics/families/families-and-households.html', note: 'Hub for data on household composition, including the presence of children under 18.' },
			{ title: 'U.S. Census Bureau — Family households', url: 'https://www.census.gov/library/stories/2024/11/family-households.html', note: 'Plain-language look at how many households include children and how that has changed.' }
		]
	},
	'households-with-seniors': {
		why: `**Households with seniors** are homes where at least one person age 65 or older lives. This is different from simply counting older adults, because it shows the living situations seniors are in — whether alone, with a spouse, or with younger family members.

This measure helps communities plan support that reaches the home. Homes with older residents may need accessibility features, in-home care, help with utilities, or safe transportation. Knowing where these households cluster helps target home repairs, meal delivery, and emergency check-ins.

It also reveals different needs — a senior living alone may need more outside support than one living with family.`,
		resources: [
			{ title: 'U.S. Census Bureau — Older Population and Aging', url: 'https://www.census.gov/topics/population/older-aging.html', note: 'Census data on the 65-and-older population, including living arrangements.' },
			{ title: 'ACL — Profile of Older Americans', url: 'https://acl.gov/aging-and-disability-in-america/data-and-research/profile-older-americans', note: 'Federal data on how older adults live, including alone or with family.' }
		]
	},
	veterans: {
		why: `**Veterans** are adults who served in the U.S. armed forces and are no longer on active duty. Counting them helps a community understand a group that may qualify for special health care, education, housing, and disability benefits through the Department of Veterans Affairs.

This number guides local planning. Areas with many veterans may need VA clinics, mental health and disability services, job programs, and outreach to make sure people know what they have earned.

Veterans bring valuable skills and leadership to their communities as workers, volunteers, and neighbors.`,
		resources: [
			{ title: 'U.S. Census Bureau — About the Veterans Population', url: 'https://www.census.gov/topics/population/veterans/about.html', note: 'How the Census defines and counts veterans and what the data cover.' },
			{ title: 'VA — National Center for Veterans Analysis and Statistics', url: 'https://www.va.gov/vetdata/veteran_population.asp', note: 'Official VA veteran population data and projections by age, sex, and location.' }
		]
	},

	// ---------------- Economy ----------------
	'household-income': {
		why: `**Median household income** is the income earned by a household right in the middle of the pack: half of households earn more, and half earn less. Unlike an average, it isn't thrown off by a handful of very high earners, so it gives a fair picture of how a typical family is doing.

Income shapes nearly every part of daily life: whether a family can cover rent, afford healthy food, handle a car repair, or save for the future. When typical incomes rise faster than the cost of living, families gain breathing room. When they stall, even working households can struggle.

Comparing median income across neighborhoods and counties helps show where good-paying work is within reach and where it is harder to get ahead.`,
		resources: [
			{ title: 'U.S. Census Bureau — Income in the United States: 2024', url: 'https://www.census.gov/library/publications/2025/demo/p60-286.html', note: 'The latest national report on household income, with the official median and trends.' },
			{ title: 'U.S. Census Bureau — About Income', url: 'https://www.census.gov/topics/income-poverty/income/about.html', note: 'Explains how the Census defines and measures money income.' }
		]
	},
	'poverty-rate': {
		why: `**The poverty rate** is the share of people whose household income falls below the federal poverty line, a dollar amount the government sets based on family size. If a family earns less than their threshold, everyone in it is counted as living in poverty.

Poverty isn't just about money. People with very low incomes are more likely to face food insecurity, unstable housing, untreated health problems, and added stress — all of which can make it harder to work, learn, and stay healthy.

Tracking the poverty rate shows how many neighbors are struggling to afford basics, and where extra support could make the biggest difference. A high rate signals greater need, not a judgment about the people or place.`,
		resources: [
			{ title: 'U.S. Census Bureau — How Poverty Is Measured', url: 'https://www.census.gov/topics/income-poverty/poverty/guidance/poverty-measures.html', note: 'Plain explanation of poverty thresholds and the income used to decide who is in poverty.' },
			{ title: 'U.S. Census Bureau — About Poverty', url: 'https://www.census.gov/topics/income-poverty/poverty/about.html', note: 'Overview of the official poverty measure, its history, and data sources.' }
		]
	},
	'child-poverty': {
		why: `**Child poverty** measures the share of children living in families with income below the poverty line. Children can't control their family's finances, so this number captures how many of the youngest residents are growing up without enough resources.

Growing up in poverty can leave lasting marks. Research links it to worse health, lower school achievement, and lower earnings later in life. From an early age, financial hardship raises the risk of chronic conditions and limits access to stable housing, nutritious food, and health care.

Because early circumstances shape long-term opportunity, child poverty is one of the strongest signals of a community's future.`,
		resources: [
			{ title: 'County Health Rankings — Children in Poverty', url: 'https://www.countyhealthrankings.org/health-data/health-factors/social-economic-factors/income/children-in-poverty', note: 'Research-backed explainer on how child poverty affects health and long-term outcomes.' },
			{ title: 'U.S. Census Bureau — How Poverty Is Measured', url: 'https://www.census.gov/topics/income-poverty/poverty/guidance/poverty-measures.html', note: 'Describes the thresholds used to determine whether children and families are in poverty.' }
		]
	},
	'unemployment-rate': {
		why: `**The unemployment rate** is the share of the labor force — people who are working or actively looking for work — who are jobless but searching. People who aren't looking for work, such as retirees or full-time students, aren't counted.

When unemployment is high, more families lose a steady paycheck, and that can ripple into missed bills, lost health insurance, and added stress. Studies link joblessness to worse physical and mental health, and a rising rate often signals a weakening local economy.

Because it focuses on people who want jobs but can't find them, the unemployment rate is a quick read on whether work is available in a community.`,
		resources: [
			{ title: 'BLS — How the Government Measures Unemployment', url: 'https://www.bls.gov/cps/cps_htgm.htm', note: 'Official guide to how unemployment and the labor force are defined and counted.' },
			{ title: 'County Health Rankings — Unemployment', url: 'https://www.countyhealthrankings.org/health-data/health-factors/social-economic-factors/employment/unemployment', note: 'Why joblessness matters for health and economic security in a community.' }
		]
	},
	employment: {
		why: `**The employment rate** is the share of working-age adults who actually have a job. Unlike the unemployment rate, it counts everyone in the population, including people who have stopped looking for work, so it can reveal hidden gaps the unemployment rate misses.

A job is one of the main ways people gain income, health insurance, and a sense of stability. When more adults are employed, more households can cover their needs and contribute to the local economy. When the rate is low, it can mean limited opportunities, barriers like child care or transportation, or workers who have given up the search.

Looking at the employment rate alongside unemployment gives a clearer view of how well a community connects residents to work.`,
		resources: [
			{ title: 'BLS — Employment-Population Ratio', url: 'https://www.bls.gov/charts/employment-situation/employment-population-ratio.htm', note: 'Measure of employed people as a share of the adult population.' },
			{ title: 'BLS — How the Government Measures Unemployment', url: 'https://www.bls.gov/cps/cps_htgm.htm', note: 'Defines who counts as employed, unemployed, and in the labor force.' }
		]
	},
	'snap-households': {
		why: `**SNAP** stands for the Supplemental Nutrition Assistance Program, the federal program once known as food stamps. It helps people with low incomes buy groceries, with benefits loaded onto a card that works like a debit card. This indicator shows the share of households receiving that help.

A higher share means more families are stretched thin enough to need food assistance, often because of low wages, job loss, or high costs. SNAP eases hunger, frees up money for rent and medicine, and is linked to better health, especially for children.

Because it responds quickly to economic stress, SNAP enrollment is a useful gauge of need. It reflects circumstances, not the character of the families or neighborhoods involved.`,
		resources: [
			{ title: 'USDA — Supplemental Nutrition Assistance Program (SNAP)', url: 'https://www.fns.usda.gov/snap/supplemental-nutrition-assistance-program', note: 'Official overview of how SNAP works, who it serves, and how benefits are used.' },
			{ title: 'USDA — SNAP Eligibility', url: 'https://www.fns.usda.gov/snap/recipient/eligibility', note: 'The income and household rules that determine who qualifies for SNAP.' }
		]
	},
	'gini-index': {
		why: `**The Gini index** is a single score, from 0 to 1, that sums up how evenly income is spread across a community. A score of 0 would mean everyone earns exactly the same; a score of 1 would mean one household has all the income. Higher numbers mean income is concentrated among fewer people.

Inequality matters because it shapes opportunity. Where the gap between the top and everyone else is wide, working families may find it harder to afford housing, save money, or move up. Large gaps are also linked to weaker community trust and worse health outcomes.

The Gini index doesn't say whether a place is rich or poor overall. Instead, it shows how the area's income is shared.`,
		resources: [
			{ title: 'U.S. Census Bureau — Gini Index', url: 'https://www.census.gov/topics/income-poverty/income-inequality/about/metrics/gini-index.html', note: 'Official definition of the Gini index and how it captures inequality on a 0–1 scale.' },
			{ title: 'U.S. Census Bureau — Understanding Income Inequality', url: 'https://www.census.gov/library/stories/2023/09/income-inequality.html', note: 'Accessible story explaining inequality measures and recent national trends.' }
		]
	},
	'white-collar': {
		why: `**Management and professional occupations** include jobs like managers, teachers, nurses, engineers, accountants, and software developers. This indicator shows the share of local workers in these roles, which usually require more formal education or training and tend to pay higher wages.

This measure is mainly context: it describes the kind of work a community's residents do. A higher share often points to more office-based and credentialed jobs, while a lower share may reflect an economy built more on service, manufacturing, or hands-on trades — all of which are essential.

Looking at the mix of occupations helps explain local income patterns and which industries are growing.`,
		resources: [
			{ title: 'BLS — Standard Occupational Classification (major groups)', url: 'https://www.bls.gov/soc/2018/major_groups.htm', note: 'Federal system that defines occupation categories, including management/professional.' },
			{ title: 'BLS — Occupational Employment and Wage Statistics', url: 'https://www.bls.gov/oes/current/oes_stru.htm', note: 'Data on employment and pay across detailed occupations.' }
		]
	},
	'internet-access': {
		why: `**Household internet access** measures the share of homes with a broadband (high-speed) internet subscription. Today, a reliable connection is a basic tool for everyday life, not a luxury.

Without home internet, it is harder to apply for jobs, do schoolwork, see a doctor through telehealth, reach government services, or compare prices and pay bills. Gaps in access — sometimes called the digital divide — often fall hardest on lower-income households, rural areas, and older residents.

Tracking who has broadband at home shows where people can fully take part in the modern economy and where investment or affordability programs are needed.`,
		resources: [
			{ title: 'U.S. Census Bureau — Why We Ask: Computer & Internet Use', url: 'https://www.census.gov/acs/www/about/why-we-ask-each-question/computer/', note: 'How the Census measures home internet and broadband and why it matters.' },
			{ title: 'U.S. Census Bureau — Computer and Internet Use', url: 'https://www.census.gov/newsroom/press-releases/2024/computer-internet-use-2021.html', note: 'National findings on broadband subscription rates, including urban–rural gaps.' }
		]
	},

	// ---------------- Education ----------------
	'bachelors-or-higher': {
		why: `**A four-year college degree opens doors.** This measure shows the share of adults age 25 and older who have earned at least a bachelor's degree. It is one of the clearest signals of a community's skill base and the kinds of jobs people can reach.

The payoff is large and well documented. Adults with a bachelor's degree typically earn far more over their lifetimes than those who stopped at high school, and the gap has held steady for years. More education is also tied to better health, longer life expectancy, and steadier employment.

For a region, a higher share of college graduates can attract employers and support a stronger tax base — but the number also raises fairness questions about who has access to college.`,
		resources: [
			{ title: 'U.S. Census Bureau — Educational Attainment', url: 'https://www.census.gov/topics/education/educational-attainment.html', note: 'National, state, and county data on degrees held by adults, with historical trends.' },
			{ title: 'NCES — Annual Earnings by Educational Attainment', url: 'https://nces.ed.gov/programs/coe/indicator/cba/annual-earnings', note: 'Federal data showing how median earnings rise with each level of education.' }
		]
	},
	'high-school-diploma': {
		why: `**A high school diploma is a basic building block of opportunity.** This measure tracks the share of adults age 25 and older who have finished high school or earned an equivalent credential like a GED. It is a foundation for nearly all further education and most steady jobs.

Finishing high school is strongly linked to better health. People with a diploma tend to live longer, report better health, and have lower rates of conditions like diabetes — much of it through the higher earnings and more stable lives a diploma helps make possible.

When a large share of adults lack this credential, it can signal gaps in schools, economic strain, or barriers that pushed people out of education.`,
		resources: [
			{ title: 'County Health Rankings — High School Completion', url: 'https://www.countyhealthrankings.org/health-data/community-conditions/social-and-economic-factors/education/high-school-completion', note: 'How high school completion connects to health, with county-level estimates.' },
			{ title: 'U.S. Census Bureau — Educational Attainment', url: 'https://www.census.gov/topics/education/educational-attainment.html', note: 'Source for the share of adults who have completed high school, by place.' }
		]
	},
	'school-enrollment': {
		why: `**Enrollment shows who is actively learning right now.** This measure captures the share of people age 3 and older who are enrolled in school, from preschool all the way through college and graduate study.

Early enrollment matters because preschool helps children arrive at kindergarten ready to learn. Strong enrollment in the later years signals that teens are staying in school and that adults are pursuing college or training that can lift their earnings.

Enrollment patterns also help local leaders plan classroom space, teachers, child care, and college programs. Shifts up or down can be an early sign of population change or new demand.`,
		resources: [
			{ title: 'U.S. Census Bureau — School Enrollment', url: 'https://www.census.gov/topics/education/school-enrollment.html', note: 'Data on enrollment from preschool through college, including public and private.' },
			{ title: 'U.S. Census Bureau — Why We Ask: School Enrollment', url: 'https://www.census.gov/acs/www/about/why-we-ask-each-question/school/', note: 'How enrollment data is collected and used to plan schools and services.' }
		]
	},
	'private-school': {
		why: `**This measure shows how families choose between public and private schools.** It reports the share of enrolled students who attend private, non-public schools rather than public ones. It offers useful context for conversations about school choice and public-school investment.

Nationally, private schools enroll a minority of students, but the share varies widely from place to place. Where it is high, it can reflect strong religious-school traditions, family income, or how confident families feel in nearby public schools.

The number does not say one type of school is better. Because public schools serve most students and a more economically mixed population, watching private enrollment alongside public investment can highlight questions of access and fairness.`,
		resources: [
			{ title: 'NCES — Private School Enrollment', url: 'https://nces.ed.gov/programs/coe/indicator/cgc/private-school-enrollment', note: 'Federal data on private K–12 enrollment, including how the share varies by state.' },
			{ title: 'NCES — Public vs. private schools (Fast Facts)', url: 'https://nces.ed.gov/fastfacts/display.asp?id=55', note: 'Quick comparison of enrollment and student characteristics across school types.' }
		]
	},

	// ---------------- Environment ----------------
	'tree-canopy': {
		why: `**Tree canopy** is the layer of leaves, branches, and stems that covers the ground when you look down on a city from above. It is usually reported as the share of land shaded by trees. Where canopy is high, neighborhoods stay cooler, the air is cleaner, and rain is slowed before it floods streets.

Trees do real work. Their shade and the water they release can drop nearby temperatures by several degrees on a hot day, which lowers cooling bills and protects people from heat illness. Leaves also catch dust and pollution, and roots soak up stormwater.

Canopy is often spread unevenly. Lower-income neighborhoods and communities of color tend to have far fewer trees, so they bake hotter in summer. That gap is what people mean by "tree equity."`,
		resources: [
			{ title: 'American Forests — Tree Equity Score', url: 'https://www.treeequityscore.org/', note: 'Interactive map scoring how fairly tree canopy is shared across neighborhoods.' },
			{ title: 'U.S. EPA — Benefits of Trees and Vegetation', url: 'https://www.epa.gov/heatislands/benefits-trees-and-vegetation', note: 'How trees cool cities, clean the air, and ease the urban heat island.' },
			{ title: 'USDA Forest Service — i-Tree', url: 'https://www.itreetools.org/', note: 'Free tools that estimate the dollar value of benefits trees provide.' }
		]
	},
	'impervious-surface': {
		why: `**Impervious surface** is any hard, sealed surface that water cannot soak through — think roads, parking lots, driveways, sidewalks, and rooftops. The measure tracks the share of land covered by these surfaces. The more pavement and buildings an area has, the less ground is left to absorb rain.

This matters for two big reasons. First, hard surfaces store and radiate heat, so paved-over areas run hotter than green ones. Second, when rain hits pavement instead of soil, it rushes off quickly, picking up oil and chemicals and overwhelming storm drains.

That fast runoff is a leading cause of local flooding, stream erosion, and water pollution. Tracking impervious surface shows where flooding risk and heat are building.`,
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
		why: `**Developed land** measures how much of the land has been built up with houses, roads, parking lots, stores, and other hard surfaces. Mapmakers often call these surfaces "impervious" because water cannot soak through them the way it does through soil or forest floor.

Some development is necessary and good, since it is where people live, work, and shop. But when developed land spreads quickly across a region, it can pave over forests, farms, and wildlife habitat. Hard surfaces also send rainwater rushing into streams and trap heat.

Watching the share of developed land over time is a clear way to see urban growth and sprawl. In the Charlotte region, rising developed land helps explain traffic, lost green space, and pressure on natural areas.`,
		resources: [
			{ title: 'USGS — National Land Cover Database', url: 'https://www.usgs.gov/centers/eros/science/national-land-cover-database', note: 'The standard U.S. map of land cover, including developed and impervious land.' },
			{ title: 'USGS — Annual National Land Cover Database', url: 'https://www.usgs.gov/centers/eros/science/annual-national-land-cover-database', note: 'Yearly snapshots back to 1985 for seeing urban growth over time.' }
		]
	},
	farmland: {
		why: `**Farmland is the working land that grows our food.** This measure tracks how much of an area's land is used for crops, pasture, and other farm production.

Farmland supports local food supply, farm jobs, and rural economies. It also shapes the look and character of a region. Once farmland is paved over for subdivisions, shopping centers, or roads, it almost never returns to growing food.

In fast-growing regions like Charlotte, sprawl is a leading cause of farmland loss. Watching this number over time shows whether a community is balancing new development with the open, working lands that feed people and filter rainwater.`,
		resources: [
			{ title: 'USDA — Census of Agriculture', url: 'https://www.nass.usda.gov/AgCensus/', note: 'The federal count of U.S. farms with land-use and acreage data down to the county.' },
			{ title: 'American Farmland Trust — Farms Under Threat', url: 'https://farmlandinfo.org/statistics/farms-under-threat/', note: 'Dashboard tracking farmland lost to development by state and county.' }
		]
	},
	wetlands: {
		why: `**Wetlands are areas where water covers the soil for much of the year**, such as marshes, swamps, and bogs. This measure shows what share of an area's land is wetland.

Wetlands act like natural sponges. They soak up heavy rain and storm runoff, which lowers flooding for nearby homes and roads. They also clean water by trapping pollution and sediment before it reaches rivers and drinking-water supplies.

Wetlands are among the richest wildlife habitats anywhere. They have been drained and filled for farms and development for centuries, so tracking how much remains helps a community protect free flood control, cleaner water, and habitat that are hard and costly to replace.`,
		resources: [
			{ title: 'U.S. EPA — Why Are Wetlands Important?', url: 'https://www.epa.gov/wetlands/why-are-wetlands-important', note: 'How wetlands control floods, clean water, and support wildlife.' },
			{ title: 'U.S. Fish & Wildlife — National Wetlands Inventory', url: 'https://www.fws.gov/program/national-wetlands-inventory', note: 'The federal program that maps and tracks the nation’s wetlands.' }
		]
	},
	'light-pollution': {
		why: `**Light pollution is the glow of artificial light that spills into the night sky and washes out the stars.** Satellites measure how bright the night is over a place, which tells us how much outdoor lighting from streetlights, signs, parking lots, and buildings is escaping upward. The most familiar form is "sky glow" — the hazy dome of brightness over a city.

This matters for more than stargazing. Bright nights confuse wildlife: migrating birds veer off course and insects that pollinate plants die circling lights. For people, too much light at night can disrupt sleep and the body's natural day-night rhythm.

Light pollution is also wasted money and energy — a large share of outdoor lighting shines uselessly into the sky.`,
		resources: [
			{ title: 'National Park Service — Light Pollution', url: 'https://www.nps.gov/subjects/nightskies/lightpollution.htm', note: 'Explains sky glow, glare, and light trespass and why a brightening sky harms ecosystems.' },
			{ title: 'NASA Earthdata — Nighttime Lights', url: 'https://www.earthdata.nasa.gov/topics/human-dimensions/nighttime-lights', note: 'How VIIRS satellites measure artificial light at night from space.' }
		]
	},

	// ---------------- Health ----------------
	obesity: {
		why: `**Obesity in adults** measures the share of adults whose weight, relative to their height, falls in a range linked to higher health risk (based on body mass index, a height-and-weight ratio). On this platform the numbers are modeled estimates that combine survey responses with population data, so treat them as close approximations rather than exact counts.

Obesity matters because it raises the risk of conditions like type 2 diabetes, heart disease, high blood pressure, and some cancers, and it drives higher medical costs.

Many causes are about access and environment, not personal willpower: the price and availability of healthy food, safe places to walk or play, work schedules, sleep, stress, and health care all play a role.`,
		resources: [
			{ title: 'CDC — Adult Obesity Facts', url: 'https://www.cdc.gov/obesity/adult-obesity-facts/index.html', note: 'How common adult obesity is, related health conditions, and medical costs.' },
			{ title: 'CDC — About PLACES', url: 'https://www.cdc.gov/places/about/index.html', note: 'Explains the model-based small-area method behind the local estimates.' },
			{ title: 'County Health Rankings — Adult Obesity', url: 'https://www.countyhealthrankings.org/health-data/population-health-and-well-being/quality-of-life/physical-health/adult-obesity', note: 'The measure, why it matters, and the community conditions that shape it.' }
		]
	},
	diabetes: {
		why: `**Diabetes in adults** measures the share of adults who have been told by a health professional that they have diabetes, a condition in which blood sugar stays too high. Most adult cases are type 2. On this platform these are modeled estimates that blend survey and population data, so they are best read as approximations.

Diabetes matters because, left unmanaged, it can lead to heart disease, kidney failure, vision loss, and nerve damage, and it adds substantial cost to households and the health system.

These numbers reflect diagnosed cases, so they can undercount people who have diabetes but haven't been tested. Access to care, affordable healthy food, and safe places to be active all influence who develops and who gets treated.`,
		resources: [
			{ title: 'CDC — Diabetes Basics', url: 'https://www.cdc.gov/diabetes/about/index.html', note: 'What diabetes is, the main types, warning signs, and prevention.' },
			{ title: 'CDC PLACES — Compare counties', url: 'https://places.cdc.gov/', note: 'Interactive tool for model-based local estimates of diabetes and other measures.' },
			{ title: 'County Health Rankings — Diabetes Prevalence', url: 'https://www.countyhealthrankings.org/health-data/population-health-and-well-being/quality-of-life/physical-health/diabetes-prevalence', note: 'The diagnosed-diabetes measure, why it matters, and its limits.' }
		]
	},
	'frequent-mental-distress': {
		why: `**Frequent mental distress** measures the share of adults who said their mental health was not good for 14 or more days in the past month. Two weeks or more in a single month points to a serious, ongoing struggle rather than a passing bad day.

This matters because mental health shapes nearly every part of daily life: work, school, relationships, sleep, and physical health. Long stretches of distress are linked to chronic conditions and higher health care costs, and they often signal a need for support that isn't being met. Rates tend to be higher where people face money worries, isolation, or barriers to care.

Because few surveys reach every neighborhood, these are modeled estimates that approximate local levels.`,
		resources: [
			{ title: 'CDC PLACES — Health Status measure definitions', url: 'https://www.cdc.gov/places/measure-definitions/health-status.html', note: 'CDC’s official definition of frequent mental distress and how it is estimated.' },
			{ title: 'SAMHSA — Find Help and Treatment', url: 'https://www.samhsa.gov/find-help', note: 'Federal hub for the 988 crisis line and free, confidential treatment locators.' },
			{ title: 'County Health Rankings — Frequent Mental Distress', url: 'https://www.countyhealthrankings.org/health-data/population-health-and-well-being/quality-of-life/mental-health/frequent-mental-distress', note: 'Overview of the measure, its data source, and limitations.' }
		]
	},
	'no-health-insurance': {
		why: `**No health insurance** measures the share of working-age adults, ages 18 to 64, who currently have no health coverage. This age group is the focus because most children and older adults can get coverage through other programs, leaving working-age adults most exposed to gaps.

Coverage matters for both health and money. People without insurance are more likely to skip checkups, screenings, and needed treatment, which can let problems grow more serious. A single emergency can also lead to large bills and debt. Uninsured rates tend to be higher among lower-income people and some racial and ethnic groups.

Because local survey data are limited, these are modeled estimates that approximate coverage in each area.`,
		resources: [
			{ title: 'KFF — Key Facts About the Uninsured Population', url: 'https://www.kff.org/uninsured/key-facts-about-the-uninsured-population/', note: 'Research fact sheet on who is uninsured, why, and the effects on care and costs.' },
			{ title: 'CDC PLACES — Prevention measure definitions', url: 'https://www.cdc.gov/places/measure-definitions/prevention.html', note: 'CDC’s official definition of the lack-of-insurance measure for adults 18–64.' },
			{ title: 'County Health Rankings — Uninsured', url: 'https://www.countyhealthrankings.org/health-data/health-factors/clinical-care/access-to-care/uninsured', note: 'Why coverage matters for care and finances, and its data source.' }
		]
	},
	'health-insurance': {
		why: `**Health insurance helps people get care without going broke.** This measure shows the share of residents who have any kind of health coverage, whether through a job, a plan they bought, Medicaid, or Medicare.

People with coverage are more likely to see a doctor, fill prescriptions, and catch problems early, when they are cheaper and easier to treat. People without it often skip care, carry medical debt, or end up in the emergency room for issues that could have been prevented.

Coverage is not spread evenly — cost is the biggest barrier, and residents with lower incomes and some communities of color are more likely to be uninsured. Tracking coverage helps a community see who is being left out.`,
		resources: [
			{ title: 'U.S. Census Bureau — Health Insurance', url: 'https://www.census.gov/topics/health/health-insurance.html', note: 'The Census Bureau’s main hub for coverage data, tables, and reports.' },
			{ title: 'U.S. Census Bureau — Small Area Health Insurance Estimates', url: 'https://www.census.gov/programs-surveys/sahie.html', note: 'Single-year uninsured estimates for every U.S. county.' },
			{ title: 'County Health Rankings — Access to Care', url: 'https://www.countyhealthrankings.org/health-data/health-factors/clinical-care/access-to-care', note: 'How insurance and provider access shape a community’s health.' }
		]
	},
	disability: {
		why: `**This measure shows the share of residents who report living with a disability.** The survey counts six broad types: difficulty with hearing, vision, thinking or remembering, walking or moving, self-care, and living independently. It is a measure of who is in the community and what they may need.

Disability is common. Roughly one in four adults reports one, and the share rises with age, so it grows as a region's population gets older.

Knowing this share helps a community plan. It signals demand for accessible sidewalks, buildings, transit, and housing, and for health and support services. People with disabilities often face extra barriers to care and higher costs.`,
		resources: [
			{ title: 'U.S. Census Bureau — Disability', url: 'https://www.census.gov/topics/health/disability.html', note: 'The Census Bureau’s main page for disability data and definitions.' },
			{ title: 'U.S. Census Bureau — Why We Ask: Disability', url: 'https://www.census.gov/acs/www/about/why-we-ask-each-question/disability/', note: 'The six disability questions and how communities use the results.' },
			{ title: 'CDC — Disability and Health Care Access', url: 'https://www.cdc.gov/disability-and-health/articles-documents/disabilities-health-care-access.html', note: 'How common disability is and the barriers to care people face.' }
		]
	},

	// ---------------- Housing ----------------
	'owner-occupied': {
		why: `**Owning your home is one of the main ways families build wealth.** This measure shows the share of lived-in homes that are occupied by their owners, rather than rented. A higher rate often points to neighborhood stability, since owners tend to stay longer and have a financial stake in the community.

Homeownership also lets families build equity over time — money they can pass on or borrow against. But access to ownership has not been equal, and large, long-standing gaps remain between racial and ethnic groups.

A low owner-occupied share is not automatically a problem; vibrant neighborhoods can have many renters. Read this number alongside cost and rent figures to get the full picture of who can afford to put down roots.`,
		resources: [
			{ title: 'U.S. Census Bureau — Why We Ask: Ownership', url: 'https://www.census.gov/acs/www/about/why-we-ask-each-question/ownership/', note: 'How home ownership (tenure) is measured and why the data matter.' },
			{ title: 'U.S. Census Bureau — Housing Vacancies and Homeownership', url: 'https://www.census.gov/housing/hvs/', note: 'Official source for U.S. homeownership and vacancy rate trends.' },
			{ title: 'Urban Institute — Reducing the Racial Homeownership Gap', url: 'https://www.urban.org/policy-centers/housing-finance-policy-center/projects/reducing-racial-homeownership-gap', note: 'Research on how ownership builds wealth and why gaps persist.' }
		]
	},
	'rent-burden': {
		why: `**Cost burden means paying 30% or more of your income on housing.** This measure counts renter households that cross that line. When rent eats up a third or more of a paycheck, there is less left for food, child care, transportation, savings, and emergencies.

A higher share signals greater need and financial strain. Cost-burdened renters are more likely to fall behind, move often, or face eviction. Households spending more than half their income on rent are considered severely burdened.

In recent years, rent burden has climbed to record levels nationwide, reaching well beyond the lowest-income renters. Tracking it locally shows where affordable rental housing is falling short.`,
		resources: [
			{ title: 'U.S. Census Bureau — Nearly half of renters are cost-burdened', url: 'https://www.census.gov/newsroom/press-releases/2024/renter-households-cost-burdened-race.html', note: 'About half of U.S. renters pay 30%+ of income on housing, with breakdowns.' },
			{ title: 'U.S. Census Bureau — Housing data hub', url: 'https://www.census.gov/topics/housing.html', note: 'Central portal for rent, home value, and housing cost data.' }
		]
	},
	'owner-cost-burden': {
		why: `**Cost burden is not just a renter issue.** Homeowners are counted as cost-burdened when their housing costs reach 30% or more of their income. For owners, those costs include the mortgage, property taxes, insurance, and utilities — not just the loan payment.

A higher share means more homeowners are stretched thin. That can make it harder to keep up with maintenance, handle a job loss or medical bill, or hold onto the home during tough times. Severe burden — paying more than half of income on housing — raises the risk of losing the home.

Watching owner cost burden alongside rent burden gives a fuller view of local affordability.`,
		resources: [
			{ title: 'U.S. Census Bureau — Why We Ask: Ownership', url: 'https://www.census.gov/acs/www/about/why-we-ask-each-question/ownership/', note: 'The homeowner cost measures (mortgage, taxes, insurance, utilities) behind cost burden.' },
			{ title: 'U.S. Census Bureau — Housing data hub', url: 'https://www.census.gov/topics/housing.html', note: 'Gateway to housing cost, mortgage, and affordability statistics.' }
		]
	},
	'vacant-homes': {
		why: `**A vacant home is one with no one living in it.** This measure shows the share of all housing units that are empty. It is a context number, not automatically good or bad, because vacancy has many causes.

Some empty units are for sale or for rent and simply between residents — a normal sign of a moving market. Others are seasonal or vacation homes, the single largest type of vacant housing nationwide. But a high vacancy rate can also flag disinvestment, where homes sit empty because of job losses, foreclosures, or neglect.

Because the reasons differ so much, it helps to read vacancy alongside local knowledge.`,
		resources: [
			{ title: 'U.S. Census Bureau — Most vacant housing is seasonal', url: 'https://www.census.gov/library/stories/2023/05/vacant-seasonal-housing.html', note: 'Shows seasonal/recreational use is the largest category of vacant homes.' },
			{ title: 'U.S. Census Bureau — Housing Vacancies and Homeownership', url: 'https://www.census.gov/housing/hvs/', note: 'Official source for vacancy rates and characteristics.' }
		]
	},
	'occupied-homes': {
		why: `**An occupied home is simply one where people live.** This measure shows the share of all housing units that are someone's residence — the flip side of the vacancy rate. Together they account for every housing unit in an area.

A high occupancy share usually means most of the housing stock is being put to use, with relatively few empty units. It offers useful context for understanding how tight or loose the local housing supply is.

Like vacancy, this number is descriptive rather than good or bad on its own. Areas with lots of seasonal or second homes show lower occupancy; year-round communities show higher occupancy.`,
		resources: [
			{ title: 'U.S. Census Bureau — Housing data hub', url: 'https://www.census.gov/topics/housing.html', note: 'Census portal covering occupancy, vacancy, and the size and type of homes.' },
			{ title: 'U.S. Census Bureau — Housing Vacancies and Homeownership', url: 'https://www.census.gov/housing/hvs/', note: 'Data on occupied and vacant units and how occupancy is defined.' }
		]
	},
	'new-homes': {
		why: `**This measure shows where new construction is happening.** It is the share of homes built in 2010 or later. Because newer homes mark recent growth, a high share points to places that have added a lot of housing in the past decade or so.

New construction matters because adding homes can ease housing shortages and help keep prices and rents in check when demand is rising. It also shapes neighborhoods, schools, roads, and local services that have to keep pace with growth.

A low share is not a problem by itself; many established, desirable areas have older housing. Reading this across the region shows which communities are expanding quickly and which are largely built out.`,
		resources: [
			{ title: 'U.S. Census Bureau — Why We Ask: Year Built', url: 'https://www.census.gov/acs/www/about/why-we-ask-each-question/year-built/', note: 'The year-built question used to gauge housing age and where newer homes are.' },
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
		why: `**A household with no car has fewer ways to reach daily life.** This measure shows the share of households where no vehicle is available. In a region built mostly around driving, families without a car often depend on buses, walking, biking, or rides from others to get to work, school, the doctor, or the grocery store.

When those options are limited or slow, people can be cut off from jobs and services that car owners reach easily. A car is also expensive to buy, insure, and maintain, so going without one can reflect cost pressures as much as choice.

Tracking this helps show where reliable, affordable transit, sidewalks, and bike routes matter most.`,
		resources: [
			{ title: 'U.S. Census Bureau — Commuting (Journey to Work)', url: 'https://www.census.gov/topics/employment/commuting.html', note: 'Official hub for commuting data, including vehicles available to households.' },
			{ title: 'Urban Institute — Transportation Access and Upward Mobility', url: 'https://upward-mobility.urban.org/framework/neighborhoods/transportation', note: 'How transportation access shapes reaching jobs, schools, and health care.' },
			{ title: 'Urban Institute — The Unequal Commute', url: 'https://www.urban.org/features/unequal-commute', note: 'How gaps in car access and transit fall unevenly across neighborhoods.' }
		]
	},
	'long-commute': {
		why: `**A long trip to work eats into time, money, and well-being.** This measure shows the share of workers whose one-way commute is 20 minutes or more — a sense of how many people face a meaningful daily drive or ride rather than a quick hop across town.

Longer commutes mean more fuel and wear on a vehicle, more hours away from family, and in many studies, more stress and worse health. They also point to a mismatch between where homes are affordable and where jobs are located.

Watching this share over time can reveal whether growth, housing costs, and road or transit investments are making the daily trip easier or harder.`,
		resources: [
			{ title: 'U.S. Census Bureau — Why We Ask About Commuting', url: 'https://www.census.gov/acs/www/about/why-we-ask-each-question/commuting/', note: 'How commute-time data is collected and used, including links to health.' },
			{ title: 'Urban Institute — The Unequal Commute', url: 'https://www.urban.org/features/unequal-commute', note: 'How long commutes burden lower-wage and transit-dependent workers most.' }
		]
	},
	'drove-alone': {
		why: `**Most local trips to work are still one person, one car.** This measure shows the share of workers who commute by driving alone, rather than carpooling, taking transit, walking, biking, or working from home.

When nearly everyone drives solo, roads fill up faster, congestion grows, and parking demand rises. Driving alone is also the most carbon-heavy way to commute: transportation is the largest source of U.S. greenhouse gas emissions, and everyday car travel is a big part of that. For households, fuel, insurance, and upkeep add up.

A high share is not a judgment of drivers; it often reflects limited alternatives.`,
		resources: [
			{ title: 'U.S. EPA — Fast Facts on Transportation Emissions', url: 'https://www.epa.gov/greenvehicles/fast-facts-transportation-greenhouse-gas-emissions', note: 'Transportation is the largest U.S. emissions source, led by everyday cars.' },
			{ title: 'U.S. Census Bureau — Commuting (Journey to Work)', url: 'https://www.census.gov/topics/employment/commuting.html', note: 'Official source for how workers get to work, including driving alone.' }
		]
	},
	'mean-travel-time': {
		why: `**The average commute is a quick pulse-check on daily life.** This measure is the typical one-way travel time to work, in minutes. Because it averages everyone's trip, it offers a simple way to compare places and watch whether commutes are getting longer or shorter over time.

When the average climbs, it usually signals heavier traffic, longer distances between affordable homes and jobs, or transit that is not keeping pace with growth. Longer trips mean more time lost each week, higher costs, and added strain on roads and the air.

For a fast-growing region, this number is an early warning light.`,
		resources: [
			{ title: 'U.S. Census Bureau — Why We Ask About Commuting', url: 'https://www.census.gov/acs/www/about/why-we-ask-each-question/commuting/', note: 'How mean travel time to work is collected and used for planning.' },
			{ title: 'Urban Institute — Transportation Access and Upward Mobility', url: 'https://upward-mobility.urban.org/framework/neighborhoods/transportation', note: 'Connects commute times and transit access to reaching opportunity.' }
		]
	}
};
