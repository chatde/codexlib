"use client";

import { useState } from "react";

const ROSETTA_EXAMPLE = `[ROSETTA DECODER]
ML=Machine Learning, NN=Neural Network,
SL=Supervised Learning, RL=Reinforcement Learning,
ACT=Activation, BP=Backpropagation,
SGD=Stochastic Gradient Descent,
BN=Batch Normalization, LN=Layer Normalization`;

const COMPRESSED = `## Neural Network Fundamentals
A neuron computes: output = ACT(W*x + b).
ACT functions introduce nonlinearity — without
them, any depth NN collapses to a single linear
transformation. ReLU dominates hidden layers.

BP computes gradients via chain rule from loss
back through the network. SGD updates weights:
w = w - lr * gradient. Adam optimizer adapts
per-parameter learning rates.

BN normalizes activations within mini-batch.
LN normalizes across features within single
sample — standard in transformers.`;

const EXPANDED = `## Neural Network Fundamentals
A neuron computes: output = Activation(W*x + b).
Activation functions introduce nonlinearity —
without them, any depth Neural Network collapses
to a single linear transformation. ReLU dominates
hidden layers.

Backpropagation computes gradients via chain rule
from loss back through the network. Stochastic
Gradient Descent updates weights: w = w - lr *
gradient. Adam optimizer adapts per-parameter
learning rates.

Batch Normalization normalizes activations within
mini-batch. Layer Normalization normalizes across
features within single sample — standard in
transformers.`;

export function PackPreview() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Compressed side */}
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface-hover">
            <span className="text-xs font-mono text-gold">compressed.codexlib</span>
            <span className="text-xs font-mono text-muted">2,940 tokens</span>
          </div>
          <pre className="p-4 text-xs font-mono text-muted leading-relaxed overflow-auto max-h-[300px]">
            <code className="text-gold/70">{ROSETTA_EXAMPLE}</code>
            {"\n\n"}
            <code>{COMPRESSED}</code>
          </pre>
        </div>

        {/* Expanded side */}
        <div className="rounded-xl border border-gold/30 bg-surface overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gold/20 bg-gold/5">
            <span className="text-xs font-mono text-gold">decoded by AI</span>
            <span className="text-xs font-mono text-gold">3,380 tokens (+15%)</span>
          </div>
          <pre className="p-4 text-xs font-mono text-foreground/80 leading-relaxed overflow-auto max-h-[300px]">
            <code>{EXPANDED}</code>
          </pre>
        </div>
      </div>

      <p className="text-center text-sm text-muted mt-4">
        Same knowledge. <span className="text-gold font-medium">440 fewer tokens.</span> The AI reads the Rosetta header and expands abbreviations automatically.
      </p>
    </div>
  );
}
