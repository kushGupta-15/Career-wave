import { NextResponse } from 'next/server';

const botResponses = {
  greeting: "Hello! I'm the Career Wave Assistant. How can I help you today?",
  jobSearch: "You can search for jobs in the following ways:\n1. Type job title in the search bar\n2. Use filters (job type, location, salary)\n3. Search by company name\n4. Browse through job listings",
  careerAdvice: "For career advice, consider these points:\n1. Keep your skills updated\n2. Build your professional network\n3. Prepare well for interviews\n4. Regularly update your resume\n5. Stay informed about industry trends",
  companyInfo: "To get company information:\n1. Check company profiles\n2. Read employee reviews\n3. Visit company websites\n4. Follow on social media\n5. Research company culture",
  default: "How can I assist you? You can ask me about job search, career advice, or company information."
};

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    const userMessage = message.toLowerCase();
    
    let response = botResponses.default;
    
    if (userMessage.includes("hello") || userMessage.includes("hi") || userMessage.includes("hey")) {
      response = botResponses.greeting;
    } else if (userMessage.includes("job") || userMessage.includes("search") || userMessage.includes("find")) {
      response = botResponses.jobSearch;
    } else if (userMessage.includes("career") || userMessage.includes("advice") || userMessage.includes("guidance")) {
      response = botResponses.careerAdvice;
    } else if (userMessage.includes("company") || userMessage.includes("organization") || userMessage.includes("firm")) {
      response = botResponses.companyInfo;
    }

    return NextResponse.json({ response });
  } catch {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
} 