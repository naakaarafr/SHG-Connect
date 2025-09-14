import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, FileText, IndianRupee, Users, Target, Calendar } from "lucide-react";

const GovernmentSchemesSection = () => {
  const majorSchemes = [
    {
      name: "Deendayal Antyodaya Yojana - National Rural Livelihoods Mission (DAY-NRLM)",
      ministry: "Ministry of Rural Development",
      description: "Organizes rural poor women into Self Help Groups (SHGs) and supports them to achieve appreciable increase in incomes",
      keyStats: {
        "Women Mobilized": "10.05 crores",
        "SHGs Formed": "90.87 lakh",
        "Bank Credit (2024)": "₹9.71 lakh crore"
      },
      lastUpdated: "Dec 20, 2024",
      releaseId: "2086490"
    },
    {
      name: "Start-up Village Entrepreneurship Programme (SVEP)",
      ministry: "Ministry of Rural Development",
      description: "Sub-scheme under DAY-NRLM that supports SHG women to set up small enterprises in rural areas",
      keyStats: {
        "Enterprises Supported": "3.13 lakh",
        "Banking Correspondent Sakhis": "1.35 lakh",
        "Revolving Fund per SHG": "₹20,000-30,000"
      },
      lastUpdated: "Oct 2024",
      releaseId: "2086490"
    },
    {
      name: "Deen Dayal Upadhyaya Grameen Kaushalya Yojana (DDU-GKY)",
      ministry: "Ministry of Rural Development", 
      description: "Placement-linked skill development program for rural poor youth (15-35 years) with mandatory 33% women coverage",
      keyStats: {
        "Women Trained (2023-24)": "1.22 lakh",
        "Women Placed (2023-24)": "94,684",
        "Total Trained (2024-25)": "69,086"
      },
      lastUpdated: "Feb 11, 2025",
      releaseId: "2101873"
    }
  ];

  const womenEmpowermentSchemes = [
    {
      name: "Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA)",
      description: "Gender-neutral scheme promoting women participation with wage parity, crèche facilities, and women mates",
      participation: "58.9% women participation in 2023-24",
      benefit: "At least 1/3rd beneficiaries must be women"
    },
    {
      name: "Indira Gandhi National Widow Pension Scheme (IGNWPS)",
      description: "Pension scheme for widows aged 40-79 years from Below Poverty Line households",
      benefit: "₹300/month (₹500 after age 80)",
      coverage: "67.36 lakh ceiling across all States/UTs"
    },
    {
      name: "Rural Self Employment Training Institutes (RSETI)",
      description: "Training for unemployed youth (18-45 years) for self-employment or wage employment",
      womenStats: "3.6 lakh women trained, 2.9 lakh settled in 2023-24",
      eligibility: "All categories including women, irrespective of caste, creed, religion"
    }
  ];

  const recentCirculars = [
    {
      title: "Empowerment of Women through Rural Development Programmes",
      date: "Feb 11, 2025",
      ministry: "Ministry of Rural Development",
      highlights: [
        "Credit accessed by women SHGs increased to ₹2,07,820 crores in 2023-24",
        "National Gender Campaign (Nayi Chetna) launched for large-scale advocacy",
        "50% reservation for women in Panchayati Raj Institutions in 21 States"
      ],
      source: "PIB Press Release ID: 2101873"
    },
    {
      title: "Bank Credit Enhancement for Women Self-Help Groups",
      date: "Dec 20, 2024", 
      ministry: "Ministry of Rural Development",
      highlights: [
        "₹48,290 crores Capitalisation Support provided to SHG members",
        "Online marketing platform www.esaras.in launched for SHG products",
        "1,245 women-owned producer enterprises established covering 15 lakh women"
      ],
      source: "PIB Press Release ID: 2086490"
    },
    {
      title: "Schemes for Women through Self Help Groups",
      date: "Jul 20, 2022",
      ministry: "Ministry of Rural Development", 
      highlights: [
        "8.39 crore rural poor women mobilized into 76.94 lakh SHGs",
        "₹5.20 lakh crore bank credit accessed by SHGs since FY 2013-14",
        "Interest subvention scheme expanded to all blocks across country"
      ],
      source: "PIB Press Release ID: 1843200"
    }
  ];

  const creditProgression = [
    { year: "2019-20", amount: "70,977" },
    { year: "2020-21", amount: "84,717" },
    { year: "2021-22", amount: "1,20,477" },
    { year: "2022-23", amount: "1,57,370" },
    { year: "2023-24", amount: "2,07,820" }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Government Schemes & Circulars
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Official schemes and recent circulars from the Government of India for 
            Self-Help Groups and Women Empowerment
          </p>
        </div>

        {/* Major Schemes */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-8">
            <Target className="h-6 w-6 text-primary" />
            <h3 className="text-2xl font-bold">Major Government Schemes</h3>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {majorSchemes.map((scheme, index) => (
              <Card key={index} className="h-full">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {scheme.ministry}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Calendar className="h-3 w-3 mr-1" />
                      {scheme.lastUpdated}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg leading-tight">{scheme.name}</CardTitle>
                  <CardDescription>{scheme.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(scheme.keyStats).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{key}:</span>
                        <span className="font-semibold text-primary">{value}</span>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                    <a href={`https://pib.gov.in/PressReleasePage.aspx?PRID=${scheme.releaseId}`} target="_blank">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Official Details
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Women Empowerment Schemes */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-8">
            <Users className="h-6 w-6 text-primary" />
            <h3 className="text-2xl font-bold">Women Empowerment Schemes</h3>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {womenEmpowermentSchemes.map((scheme, index) => (
              <Card key={index} className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">{scheme.name}</CardTitle>
                  <CardDescription>{scheme.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {scheme.participation && (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">Participation</Badge>
                        <span className="text-sm font-semibold">{scheme.participation}</span>
                      </div>
                    )}
                    {scheme.benefit && (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">Benefit</Badge>
                        <span className="text-sm font-semibold">{scheme.benefit}</span>
                      </div>
                    )}
                    {scheme.womenStats && (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">Women Stats</Badge>
                        <span className="text-sm font-semibold">{scheme.womenStats}</span>
                      </div>
                    )}
                    {scheme.coverage && (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">Coverage</Badge>
                        <span className="text-sm font-semibold">{scheme.coverage}</span>
                      </div>
                    )}
                    {scheme.eligibility && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground">{scheme.eligibility}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Credit Progression Chart */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-8">
            <IndianRupee className="h-6 w-6 text-primary" />
            <h3 className="text-2xl font-bold">SHG Credit Growth (₹ Crores)</h3>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-5 gap-4">
                {creditProgression.map((data, index) => (
                  <div key={index} className="text-center">
                    <div className="bg-primary/10 rounded-lg p-4 mb-2">
                      <div className="text-2xl font-bold text-primary">₹{data.amount}</div>
                      <div className="text-xs text-muted-foreground">crores</div>
                    </div>
                    <div className="text-sm font-medium">{data.year}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Credit accessed by women Self Help Groups has grown from ₹70,977 crores to ₹2,07,820 crores
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Circulars */}
        <div>
          <div className="flex items-center gap-2 mb-8">
            <FileText className="h-6 w-6 text-primary" />
            <h3 className="text-2xl font-bold">Recent Government Circulars</h3>
          </div>
          <div className="space-y-6">
            {recentCirculars.map((circular, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary">{circular.ministry}</Badge>
                    <Badge variant="outline">
                      <Calendar className="h-3 w-3 mr-1" />
                      {circular.date}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{circular.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Key Highlights:</h4>
                    <ul className="space-y-2">
                      {circular.highlights.map((highlight, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Source: {circular.source}</span>
                      <Button variant="outline" size="sm" asChild>
                        <a href="https://pib.gov.in/" target="_blank">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          PIB Archives
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Stay Updated with Government Schemes</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Keep track of the latest government circulars, scheme updates, and funding opportunities 
                for Self-Help Groups and women empowerment initiatives.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button asChild>
                  <a href="https://rural.gov.in/" target="_blank">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ministry of Rural Development
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="https://nrlm.gov.in/" target="_blank">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    DAY-NRLM Portal
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="https://pib.gov.in/" target="_blank">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Press Information Bureau
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default GovernmentSchemesSection;