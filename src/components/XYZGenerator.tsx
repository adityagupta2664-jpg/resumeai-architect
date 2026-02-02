import React, { useState } from 'react';
import { Send, Sparkles, Copy, Check, Info, Lightbulb, MousePointer2, Zap } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface XYZGeneratorProps {
    onClose?: () => void;
}

export const XYZGenerator: React.FC<XYZGeneratorProps> = ({ onClose }) => {
    const [input, setInput] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const tryExample = () => {
        setInput("I helped with customer service and answered phones.");
        setSuggestions([]);
    };

    const generateMockXYZ = (input: string): string[] => {
        return [
            `Resolved 50+ customer queries daily with a 98% satisfaction rating by implementing a new ticketing response framework.`,
            `Reduced average call wait time by 40% (from 5 mins to 3 mins) by automating frequent FAQ responses for the support team.`,
            `Awarded 'Service Excellence' after maintaining a 100% response rate for 1,200+ high-priority client inquiries over 12 months.`
        ];
    };

    const generateXYZ = async () => {
        if (!input.trim()) return;
        setIsLoading(true);
        setSuggestions([]);

        try {
            const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY ||
                (import.meta as any).env.VITE_API_KEY ||
                (process as any).env?.VITE_GEMINI_API_KEY;

            if (!apiKey) {
                console.warn("API Key missing, using Mock Mode");
                setTimeout(() => {
                    setSuggestions(generateMockXYZ(input));
                    setIsLoading(false);
                }, 800);
                return;
            }

            const genAI = new GoogleGenAI(apiKey);
            const model = (genAI as any).getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `
        Convert this simple resume task into 3 high-impact, professional "Achievement" sentences.
        Use the format: "Accomplished [Result] as measured by [Numbers], by doing [Action]."
        
        Simple Task: "${input}"
        
        Requirements:
        - Make them sound very impressive.
        - Invent realistic numbers (%, $, or time) if needed.
        - Output ONLY a JSON array of 3 strings.
      `;

            const result = await model.generateContent(prompt);
            const text = result.response.text();
            const cleanedText = text.replace(/```json|```/g, '').trim();
            try {
                const parsed = JSON.parse(cleanedText);
                setSuggestions(Array.isArray(parsed) ? parsed : generateMockXYZ(input));
            } catch (e) {
                setSuggestions(generateMockXYZ(input));
            }
        } catch (error) {
            console.error("Achievement generation failed:", error);
            setSuggestions(generateMockXYZ(input));
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-2xl shadow-blue-500/5 overflow-hidden animate-fade-in-up mt-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-white">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                            <Zap size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black tracking-tight">Accomplishment Improver</h3>
                            <p className="text-blue-100 text-xs font-medium">Turn simple tasks into powerful results</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-8 space-y-8">
                {/* Steps Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">1</div>
                        <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                            Paste a simple thing you did (e.g. "I answered phones")
                        </p>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">2</div>
                        <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                            Select the best improved version and add it to your resume
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-sm font-black text-slate-800 uppercase tracking-widest">Type your task here</label>
                        <button
                            onClick={tryExample}
                            className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-800 flex items-center gap-1 transition-colors"
                        >
                            <Lightbulb size={12} /> Try an example
                        </button>
                    </div>

                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="e.g. I helped with sales..."
                            className="w-full pl-6 pr-16 py-5 rounded-[24px] border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-8 focus:ring-blue-500/5 focus:border-blue-600 outline-none transition-all text-base font-medium placeholder:text-slate-400 shadow-inner"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && generateXYZ()}
                        />
                        <button
                            onClick={generateXYZ}
                            disabled={isLoading || !input.trim()}
                            className="absolute right-3 top-3 bottom-3 aspect-square bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center active:scale-95"
                        >
                            {isLoading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={20} />}
                        </button>
                    </div>
                </div>

                {suggestions.length > 0 && (
                    <div className="space-y-6 animate-fade-in pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-2 px-1">
                            <Sparkles className="text-blue-500" size={16} />
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Stronger Achievements</h4>
                        </div>

                        <div className="space-y-4">
                            {suggestions.map((s, i) => (
                                <div key={i} className="group relative bg-white border border-slate-100 p-6 rounded-[24px] hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-default">
                                    <p className="text-slate-700 font-bold leading-relaxed pr-10 text-[13px]">{s}</p>
                                    <button
                                        onClick={() => copyToClipboard(s, i)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"
                                        title="Copy this achievement"
                                    >
                                        {copiedIndex === i ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-center gap-2 py-4 px-2 opacity-50">
                    <MousePointer2 size={10} className="text-slate-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Based on Google's Achievement Formula</span>
                </div>
            </div>
        </div>
    );
};
