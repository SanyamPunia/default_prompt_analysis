"use client";

import { useState } from "react";
import OpenAI from "openai";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { marked } from "marked";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const steps: string[] = [
  "Step 1: Bifurcate metals vs other materials for a Tunnel boring machine, 6600 mm diameter and present it in a table.",
  "Step 2: Identify components of the Tunnel Boring Machine and provide chemical composition of metals used in each component. Present it in a tabular form.",
  "Step 3: Provide the industry benchmark of weight distribution, component-wise, and deviation from the previous step.",
  "Step 4: Combine final simplified empirical formula to identify weight proportionality.",
  "Step 5: Provide specifications of a commonly used tire building machine with weight proportionality.",
  "Step 6: Add real-life machine manufacturer examples and links from 'makeinchina.com' and 'indiamart.com'.",
];

export default function Home() {
  const [response, setResponse] = useState<string | Promise<string>>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function getStepResponse(step: string): Promise<string> {
    try {
      const result = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a highly knowledgeable assistant specializing in detailed technical analysis. Provide responses in markdown format, ensuring that you include precise, in-depth specifics about each component, its materials, and relevant data. Where applicable, include tables for better clarity. Additionally, please provide links to credible sources, product pages, or technical documentation to back up your analysis, such as makeinchina.com or indiamart.com. Your responses should be highly informative and contain all constituent details, including chemical compositions, material weights, and industry benchmarks.",
          },
          { role: "user", content: step },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      });

      return result.choices[0].message.content || "No response generated.";
    } catch (error) {
      console.error("Error fetching OpenAI response:", error);
      return "An error occurred while generating the response.";
    }
  }

  const handleGenerateResponse = async () => {
    setIsLoading(true);
    setResponse("");

    let responseText = "";
    for (let step of steps) {
      const stepResponse = await getStepResponse(step);
      responseText += `## ${step}\n\n${stepResponse}\n\n`;
    }

    const htmlContent = marked(responseText);
    setResponse(htmlContent);
    setIsLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            Tunnel Boring Machine Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleGenerateResponse}
            disabled={isLoading}
            className="w-full mb-8"
          >
            {isLoading ? "Generating..." : "Generate Analysis"}
          </Button>

          {response && (
            <div className="mt-8 p-4 border border-gray-300 rounded">
              <h2 className="text-xl font-semibold mb-2">AI Response:</h2>
              <div className="markdown-container">
                <div
                  className="whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: response }}
                ></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
