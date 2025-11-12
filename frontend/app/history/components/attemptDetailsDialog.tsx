import React from "react"
import { Attempt } from "../../../services/history/realHistory";
import ProblemDescriptionPanel from "../../collaboration/components/ProblemDescriptionPanel";

interface AttemptDetailsDialogProps {
    attempt: Attempt;
    question: any;
    onClose: () => void;
}

const AttemptDetailsDialog: React.FC<AttemptDetailsDialogProps> = ({ attempt, onClose, question }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Dialog Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-semibold">Attempt Details</h2>
                </div>

                {/* Dialog Body + Submitted Code + Output */}
                <div className="w-full p-6 space-y-6">
                    {/* Problem Description Panel */}
                    <ProblemDescriptionPanel question={question} loading={false} error={null} fullWidth />

                    {/* Submitted Code */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Submitted Code</h3>
                        <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
                            <code> {attempt.code ?? "// No code submitted."} </code>
                        </pre>
                    </div>

                    {/* Output / Result */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Output / Result</h3>
                        <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
                            <code> {attempt.output ?? "// No output available."} </code>
                        </pre>
                    </div>
                </div>

                {/* Close Button */}
                <div className="flex justify-end p-4 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AttemptDetailsDialog;
