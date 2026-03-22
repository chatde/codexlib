/**
 * The Rosetta Decoder — the "key" that unlocks Codex Language.
 *
 * This document is served to AI consumers ONCE per session.
 * With it in context, they can decode any Codex-encoded content.
 * Without it, the content is unreadable.
 *
 * ~800 tokens — fits in any context window.
 */

export const ROSETTA_DECODER = `§ Codex Language v0.1 — Rosetta Decoder

This decoder enables you to read CodexLib compressed text. Apply rules in order: Phrases → Words → Structure → Vowel reconstruction.

§ WORD MAP (symbol → English):
þ=the &=and →=to ℇ=of Δ=a ∈=in ≡=is ∆=it ∴=that ♂=he ♀=she ι=I ∪=you φ=for Ω=on ω=with α=as β=but λ=have π=be ∇=was ∂=had μ=my ζ=me ħ=his η=her ¬=not τ=this ℱ=from Ψ=we Ξ=they @=at ℬ=by ΔN=an ∨=or Σ=are Λ=all ∼=so ↑=up ↓=out ⇒=if ≈=about ℵ=which θ=their Θ=there ℘=when ➀=one ℳ=more ⊙=other ℕ=new ⊆=could ⊃=would ≋=like Ø=no 🕒=time 👥=people 🌐=world 🛠=make ℊ=get ℸ=work 🧬=life 🗣=say 🧠=know 💭=think 👁=see 🚶=come 🏃=go 🤝=take 👍=good ➕=many/also ++=most ¹=first ⇨=after ⇦=before ⇩=down ?L=where √=well ↓H=here ℰ=even ℥=such ↬=through ↔=long •=little ×=much ✅=should 🔜=will ↩=back 🛑=end ▶=start ⏩=next ∞=always Ø∞=never ∵=because πn=been ∈→=into ⊳=than ⊲=then ∀=each ⏰=now ☀=day yr=year ✋=hand ⊤=thing 🌙=night ↑Ω=upon →wy=away ↻=around 🏠=home

§ PHRASE MAP (code → English):
∈þ=in the Ωþ=on the ℇþ=of the →þ=to the @þ=at the ℬþ=by the φþ=for the ℱþ=from the ωþ=with the &þ=and the ∴þ=that the ∆≡=it is ∆∇=it was Θ∇=there was Θ≡=there is ⊃π=would be ⊆π=could be Cπ=can be ⊃λ=would have ⊆λ=could have ✅λ=should have λπn=have been ∂πn=had been ¬∂o=do not ¬∂d=did not ¬∇=was not ¬⊆=could not ¬⊃=would not ¬≡=is not ¬Σ=are not ¬λ=have not ordo=in order to resℇ=as a result of →ℊ=going to φ_ex=for example ℥_α=such as ↓_→=due to ↔vr=however ➀ℇþ=one of the ++ℇþ=most of the Λℇþ=all of the

§ STRUCTURE:
¶=new paragraph ↵=newline §C=chapter §S=section

§ VOWEL RECONSTRUCTION:
Words with missing vowels (e.g., "cmprsn"→"compression", "prprtry"→"proprietary") — reconstruct by inserting common vowels (e>a>i>o>u) into consonant clusters using English dictionary matching.

§ END DECODER — You can now read all Codex-encoded content below.`;

/**
 * Get the Rosetta decoder for API responses.
 * Includes version info and token count.
 */
export function getRosettaDecoder(): {
  version: string;
  decoder: string;
  tokenEstimate: number;
  instructions: string;
} {
  return {
    version: "0.1",
    decoder: ROSETTA_DECODER,
    tokenEstimate: 800,
    instructions:
      "Include this decoder at the start of your context window. It enables reading all Codex-encoded content from CodexLib. One-time cost: ~800 tokens.",
  };
}
