What's new

Updates on my research and expository papers, discussion of open problems, and other maths-related topics. By Terence Tao

- Home
- About
- Career advice
- On writing
- Books
- Mastodon+
- Applets

- Subscribe to feed

# A digestion of the proof of Sendov’s conjecture

12 August, 2026 in [expository](https://terrytao.wordpress.com/category/expository/), [math.CV](https://terrytao.wordpress.com/category/mathematics/mathcv/) | Tags: [AI](https://terrytao.wordpress.com/tag/ai/), [Lech Mazur](https://terrytao.wordpress.com/tag/lech-mazur/), [Sendov's conjecture](https://terrytao.wordpress.com/tag/sendovs-conjecture/) | by [Terence Tao](https://terrytao.wordpress.com/author/teorth/)

This post concerns the following conjecture [of Sendov](https://zbmath.org/3254142), as well as its strengthening by [Phelps–Rodriguez](https://zbmath.org/3386011):

> Conjecture 1 (Sendov’s conjecture) Let , and let be a degree polynomial with all zeroes in the unit disk. Then for every zero of , there exists a critical point of with .

> Conjecture 2 (Phelps–Rodriguez conjecture) Let , and let be a degree polynomial with all zeroes in the unit disk. Then for every zero of , there exists a critical point of with , unless is on the unit circle and is a scalar multiple of .

By applying a rotation around the origin, we can normalize to be a real number with.

From the [work of Rubinstein](https://zbmath.org/3274887), both conjectures were already established in the case, so one can restrict to the case. Both of these conjectures then follow from

> Conjecture 3 (Sendov’s conjecture in interior) Let . Let be a degree polynomial with all zeroes in the unit disk. Then if is a zero of , there exists a critical point of with .

All three of these conjectures were established for (in a sequence of papers culminating in [this paper of Brown and Xiang](https://zbmath.org/1286149)) and for sufficiently large (in [a paper of myself](https://terrytao.wordpress.com/2020/12/08/sendovs-conjecture-for-sufficiently-high-degree-polynomials/), which in turn built upon several partial results in this setting). This left the case of intermediate to be settled. My arguments used some qualitative ingredients (most notably analytic continuation) and as such did not easily lend themselves to quantifying the threshold of above which the argument was valid.

Recently, Lech Mazur [was able to use an AI tool](https://www.proofatlas.ai/papers/sendov-conjecture/SENDOV_CONJECTURE_PROOF_AUGUST_5_2026.pdf) to resolve Sendov’s conjecture for all, with the proof [verified in Lean](https://www.proofatlas.ai/formalizations/sendov-conjecture/). However, the AI-generated proof was not human-digested to be in the form of a publication-ready preprint; and it has taken me several days (with [heavy AI assistance](https://chatgpt.com/share/6a7ceea8-5aa0-83e8-a56b-67cd7ec59f06)) to perform such a digestion, to place the proof in proper context with previous literature and to simplify and streamline the argument to highlight the main ideas. (Note: the above chat log only represents a portion of the digestion work: the rest was performed with pen and paper, or using some further AI agents.) The same arguments also give a new proof of Rubinstein’s theorem, which I also give below the fold.

One consequence of this digestion is that the argument in fact demonstrates Conjecture [3](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#interior), and thus resolves both the Sendov conjecture and the Phelps–Rodriguez conjecture in full generality.

The proof ends up being remarkably elementary. No complex analysis is used other than the fundamental theorem of algebra (and very basic facts about Möbius transformations); and the deepest inequality used as input is the [Maclaurin inequality](https://en.wikipedia.org/wiki/Maclaurin%27s_inequality) (and we only need a special case of that inequality which can be derived from the arithmetic mean-harmonic mean inequality and an induction argument).

Using an AI agent, I [have been able to formalize](https://github.com/teorth/sendov) the entire argument in Lean, extended to by some minor modifications to the proof. This formalization is more streamlined than the original formalization (it has about 15,000 lines of code, compared with around 90,000 for the original proof).

We now prove Conjecture [3](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#interior). The cases have long been known but need to be treated separately; a short proof using the machinery developed here is provided at the end of the post. Suppose now that we have a counterexample for some, thus one can find a degree polynomial with zeroes

for some and , in the closed unit disk, whose critical points all lie a distance at least from . We use notation here in the non-asymptotic sense, thus means that for some absolute constant (independent of ). We will also use the notation to denote a quantity that is bounded in magnitude by .

To capture the fact that the critical points lie at a distance at least from, we write these critical points as

for some (non-zero) in the closed unit disk.

> Example 4 If and , then are the non-trivial roots of unity, while the are all equal to . Strictly speaking this is not actually a counterexample to Conjecture 3 , because is not strictly less than one; nevertheless this is an important motivating near-counterexample for the arguments below.

> Example 5 A generalization of the previous example was studied in Section 4 of my paper . Here one took
>
>
> where was an asymptotic parameter going to infinity,
>
>
> was a low-degree polynomial for some ,
>
>
> and were constants. This polynomial has a zero at , critical points at , and additional critical points near . If all the critical points were at distance at least one from , one would have
>
>
> and
>
>
> while if all the zeroes were in the unit disk, the calculations in my paper showed that Here denotes a quantity that goes to zero as . If one ignores the errors, one can show that these conditions are only simultaneously feasible if and all the vanish, but the argument was somewhat subtle (I had to proceed by inspecting the second Fourier coefficient of (1) ). This illustrates the fact that the regime is particularly delicate.

We now have two sets of points in the closed unit disk: and. They “communicate” with each other through the polynomial and its first derivative, both of which can be expressed in terms of either set of points (as well as and). Indeed, if we normalize to be monic, then we can factor in terms of the zeroes as

and thus upon differentiating Here and in the sequel we adopt the convention of removing singularities when dealing with expressions that involve multiplication by both and , by cancelling such terms first in the event that .

In a similar vein, can be factored

and thus on integrating (and using )

It is convenient to rule out the easy case right away. In this case we see from [(3)](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#p-deriv-zero), [(4)](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#p-factor) that

which is absurd since the first product has magnitude at most one, and the second product has magnitude at least one. Thus we can assume henceforth that .

By inspecting or at various natural locations, we can thus obtain a number of identities relating the to the. We record the ones that we actually need here:

> Lemma 6 (Communication identities) Let denote the function
>
>
> - (i) (Centroid identity) We have That is to say, the centroid of the zeroes equals the centroid of the critical values.
> - (ii) (Polar identity) We have
> - (iii) (First origin identity) We have
> - (iv) (Second origin identity) We have (Again, we are using the convention of removing singularities to deal with the case where some of the vanish.)

*Proof:* For (i), we inspect the behavior of as. From [(2)](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#p-eq-zero) we have

and thus on differentiating term by term

Meanwhile, from (4) we have

Comparing coefficients, we obtain the claim.

For (ii), we consider the expression. On the one hand, from [(2)](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#p-eq-zero), [(3)](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#p-deriv-zero) one has

(Note from hypothesis that cannot be a critical point, so the denominator is non-zero.) On the other hand, from (4) , (5) one has

Equating the two identities, we obtain (ii) after some algebra.

For (iii), we evaluate. From [(2)](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#p-eq-zero) we have

while from (5) we have

Equating the two identities, we obtain (iii) after some algebra using (6) .

For (iv), we similarly evaluate. From [(3)](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#p-deriv-zero) we have

while from (4) one has

Equating the two identities, we obtain (iv) after some algebra using (6) .

Remarkably, the polynomial will play no further role in the argument: the identities in (i)-(iv), together with the hypotheses that and lie in the closed unit disk, will be sufficient by themselves to obtain a contradiction.

> Example 7 Continuing the example in Example 4 , in (i) both sides vanish. In (ii), both sides are equal to one. For (iii) and (iv), we have , with both sides of (iii) equal to one, and both sides of (iv) equal to zero.

> Remark 8 The centroid identity is extremely classical, going back to this 1948 paper of Popoviciu . The comparison of the polynomial at a location and at the polar inversion of that location across the closed unit disk is a familiar trick in the literature; see, e.g., Lemma 5 and Theorem 8 of Dégot . The specific form of the polar identity is implicit in the first part of Section 5 of Mazur’s AI-generated proof , while the origin identities are extracted from equation (6.3) of that proof. The first origin identity is also very close to Theorem 6 of Dégot, while the second origin identity is similar to some identities appearing in the proof of Lemma 6 of Dégot, as well as the work of Mir–Nazir–Wani and (in the case) Rubinstein . The work of Meir–Sharma and Mir–Nazir–Wani also contain several further identities relating the to the ; see in particular Lemma 15 below. Variants of (5) also appear in Proposition 10 of Miller .

> Remark 9 The first origin identity (9) is already strong enough to handle asymptotically all examples of the form in Example 5 , except in the endpoint case where vanish and the are all . Indeed, as the are in the closed unit disk, (9) implies that
>
>
> On the other hand, routine calculations (omitted here) show that
>
>
> leading asymptotically to the constraint
>
>
> But all terms here are non-negative (since ), so this forces a contradiction unless (and hence also ) and the all vanish.

As mentioned in Example [5](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#ex2), the most delicate regime occurs when. It is convenient to introduce the normalized version

of , thus , and the case corresponds to . Informally, measures how close is to (at the scale of ).

A key role in the argument will be played by the mean

of the , particularly the real part . As the all lie in the unit disk, the mean does also, so that

and On the other hand, in the example in Example 4 , is equal to the extremal value of , and . In Example 5 , we have (and ).

It will be convenient to work with the quadratic polynomial

with a particular emphasis on the value at : One should primarily think of as a measure of how close is to . Clearly we have

for all (note that is strictly less than ).

The arguments will revolve around the relationship between and. Specifically, we will establish the following two inequalities below the fold. The first inequality, which we call the “polar inequality”, comes in three forms:

> Proposition 10 (Polar inequality)
>
>
> - (i) (Raw polar inequality) We have
> - (ii) (Polar inequality in , form) We have
> - (iii) (Simplified polar inequality) We have In particular, since , one has

It will be the inequality [(18)](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#beta-bound) that we use in practice, but it will be derived from [(17)](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#lt), which in turn is a consequence of [(16)](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#1Q), which will follow from the polar identity [(8)](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#polar-ident) together with the fact that the and lie in the unit disk. The bound [(18)](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#beta-bound) is only slightly weaker than [(17)](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#lt); see the (Gemini-generated) image below.

I was not able to find an exact duplicate of the above polar inequalities in past literature, but the [paper of Dégot](https://zbmath.org/6269492) contains several similar inequalities. The inequality [(16)](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#1Q) was extracted from (5.1) of [Mazur’s AI-generated proof](https://www.proofatlas.ai/papers/sendov-conjecture/SENDOV_CONJECTURE_PROOF_AUGUST_5_2026.pdf); the subsequent bounds [(17)](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#lt), [(18)](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#beta-bound) arose from my attempts to simplify the arguments after that point.

The second inequality, which is more difficult, also will come in several forms:

> Proposition 11 (Origin inequality) Let .
>
>
> - (i) (Raw origin inequality) We have
> - (ii) ( bound) We have
> - (iii) (Origin inequality in , form) We have

Part (i) (which was extracted with some effort from Section 6 of the [original AI-generated argument](https://www.proofatlas.ai/papers/sendov-conjecture/SENDOV_CONJECTURE_PROOF_AUGUST_5_2026.pdf)) will be deduced from the first and second origin identities [(9)](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#first-origin), [(10)](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#second-origin), as well as the centroid identity [(7)](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#centroid-ident). Part (ii) will follow from (i) and the polar inequality [(18)](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#beta-bound), while part (iii) is an elementary consequence of (i).

As it turns out, the last three terms in [(21)](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#1le) are asymptotically negligible as. Dropping those terms gives a competing feasibility region for and which is disjoint from the one coming from the polar inequality [(17)](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#lt) (or [(18)](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#beta-bound)):

This already suggests that one can use this approach to recover my previous result on Sendov’s conjecture holding for all sufficiently large. In fact, even with the three error terms in [(21)](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#1le) added, there is enough room between the two inequalities [(18)](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#beta-bound), [(21)](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#1le) to obtain a contradiction for all (using the additional bound to control these errors), although showing this for medium-sized (such as) requires a certain amount of computer assistance.

For fixed, the right-hand side of [(21)](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#1le) is monotone increasing in (or equivalently, monotone decreasing in). In view of [(18)](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#beta-bound), we can thus replace by in this inequality, so that is replaced by

and replaced by . The inequality (21) then becomes an inequality involving only and : We also note that the bounds force the constraint

This prevents from getting too close to the upper limit (or getting too close to zero).

We can now eliminate all large degrees, e.g.,, as follows. The quadratic attains its minimum at. For we have

while for (if this region is non-vacuous) we can bound the quadratic by its value at . Thus

Evaluating these expressions, we arrive at

Since , we have . Next, we claim that . As is monotone increasing in , it suffices to do this when . Here one can directly compute that

since the discriminant of the numerator is negative, we conclude that

as desired.

Dropping some and terms, we conclude that

Every term on the right-hand side can be seen to be decreasing in for . Thus the right-hand side can be bounded by

giving the desired contradiction.

The remaining range to handle is when

It turns out that (22) remains infeasible in this range. This can be illustrated numerically without much difficulty: see this applet . For instance, in the most delicate case , the right-hand side of (22) only gets as large as (and in particular stays below ) throughout the range :

I have also [verified this bound in Lean](https://github.com/teorth/sendov).

**— 1. The polar inequality —**

We begin with a proof of Proposition [10](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#polar).

As is well known, the Möbius transform maps the closed unit disk to itself. In particular, we have

for all of the zeroes . Inserting this into the polar identity (8) and using the triangle inequality, we conclude the lower bound We now convert this bound to a bound involving the quantity in (12) . From the arithmetic mean-geometric mean inequality we have and from (12) we have

Since , we thus have giving the raw polar inequality (16) .

Bounding by and using the quantities from [(11)](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#alpha-def), [(15)](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#beta-def), we observe that

Using the basic inequality , we thus have

with strict inequality for . From (16) we conclude (17) . This also implies , since otherwise the integrand is always bounded by , which is absurd.

On evaluating the integral in [(17)](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#lt), we obtain

and thus

so on taking logarithms we obtain

It remains to establish the bound Here we use an AI-generated argument. One can directly calculate

where and . If we can show that for all , then taking logarithms in (17) yields

from which (26) will follow by routine algebra.

Both sides of [(27)](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#lsh) vanish at. Taking derivatives, it suffices to show that

which rearranges to

To expand the left-hand side, we use the double angle formulae and

to rewrite it as

Collecting the coefficient of for and extracting a common factor of , one is left with

where . (The remaining coefficients, which also receive contributions from the polynomial terms, all vanish.) Thus the left-hand side has the Taylor expansion

in which every coefficient is non-negative, giving the claim.

> Remark 12 As the image in the introduction suggests, the bound (18) is only slightly weaker than (17) . For small , one can perform Taylor approximation on the latter bound to obtain
>
>
> while the former bound is
>
>
> Note that is slightly smaller than .
>
>
> Relating to this, the constant in [(27)](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#lsh) cannot be improved.

**— 2. The origin inequality —**

Now we turn to the proof of Proposition [11](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#origin), which is more difficult and revolves around an analysis of the function defined in [(6)](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#F-def). We begin with a heuristic analysis. Inserting the approximation for small into [(6)](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#F-def) and using [(12)](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#xy-def), we are led to the approximation

at least when is small (which turns out to be the dominant regime in applications). This suggests a relation between the two expressions involving in the origin identities in Lemma 6 . Substituting in this approximation, we obtain some (slightly complicated) approximation for the sum in terms of , , , , and the product .

As lie in the closed unit disk, the product does also. However, past experience with the Sendov conjecture has taught us that the worst cases tend to be when lie very close to the boundary of the disk, so that is close to one. For instance, in Example [4](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#ex) all the and lie on the unit circle, and. See Remark 3 of [Dégot](https://zbmath.org/6269492) or Theorem 1.10(ii) of [my own paper](https://zbmath.org/7681950) for other places where this heuristic is noted. To simplify the discussion, let us assume for now that is exactly one, so that all lie on the unit circle. This leads in particular to the inversion identities

The centroid identity in Lemma 6 (i) relates the sum of the with the sum of the . Using (31) , this gives a similar identity relating the sum of the with the sum of the . The latter sum is of course just . This combines well with the previous approximation, thus giving an approximate identity relating , to , , and . As it turns out, the roles of and are minor and can be quickly eliminated for the purposes of obtaining useful bounds, leading eventually to the relation in Proposition 11 .

We turn to the details. To make the approximation [(30)](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#1fq) more precise, we note that, and hence by the fundamental theorem of calculus

The heuristic (29) predicts that , which would give (30) . If we actually differentiate (6) carefully, we obtain the exact identity

Bounding , we write this

When faced with a similar expression in [(24)](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#amgm), we used the arithmetic mean-geometric mean inequality. Here, the analogous tool is [Maclaurin’s inequality](https://en.wikipedia.org/wiki/Maclaurin%27s_inequality), which gives

and hence by Cauchy–Schwarz

Repeating the calculations used to show (25) , we have

and so we obtain the bound

Integrating this, we obtain a rigorous analogue of (30) ,

and thus by the triangle inequality From the first and second origin identities (9) , (10) we have

The next step is thus to estimate. When, then all the were on the unit circle and we could use [(31)](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#inverse) (and the centroid identity) to proceed. Now, we are no longer assuming to equal, but we can still adapt the previous arguments with a loss proportional to. The key lemma is

> Lemma 13 (Defect lemma) Let be some points in the closed unit disk. Then

*Proof:* By a limiting argument we may assume that none of the vanish. If we write for some, then we can calculate that

and

Thus the desired inequality reduces to the superadditivity property

But from the sinh addition formula we have

for all non-negative (this also follows from the convex nature of together with ), and the claim follows by induction.

We remark that the lemma can also be proven by direct induction, without an appeal to hyperbolic trigonometry.

From taking complex conjugates of the centroid identity [(7)](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#centroid-ident) and performing some algebra, we have

Using the defect lemma (applied to the points ) and the triangle inequality we conclude that

where as before we are removing singularities when some of the vanish. Applying (12) and some algebraic manipulation, we arrive at

Substituting this back into (33) , we conclude that

and hence after some algebra and the triangle inequality

Inserting this into (32) , we obtain We can simplify (34) by reducing to the case. Indeed, we shall show that which implies that the right-hand side of (34) is non-decreasing in in the range . Thus we may replace by in (34) to conclude that Let us now verify (35) . Using and the triangle inequality, we can lower bound

Inserting this into (35) and clearing denominators, we reduce after some algebra to

But as a quadratic polynomial in , the left-hand side has discriminant , which one can check to be negative for sufficiently large (in fact suffices), giving the claim (35) .

Next we eliminate the role of the imaginary term. Observe for any complex number with positive real part that

as can be seen by squaring both sides. The expression has real part

which lies between and (in particular, it is positive), and imaginary part of magnitude at most

by (13) . We conclude that

The right-hand side can be rearranged using the quantity from (11) as

so the bound (36) gives (19) .

**— 2.1. Upper bound on —**

Now we can prove [(20)](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#17). Suppose for contradiction that; since, this implies that. Crudely discarding the term in [(19)](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#origin-exact) and bounding by, we have

The quadratic polynomial equals at and attains its minimum at with value . By convexity, we thus have

for and

for (this latter statement is vacuous if ). Since , we can therefore crudely bound

and hence

From (15) we have , thus by (18) one has

From another application of (18) one has

We conclude that

It is now convenient to introduce the quantity , thus with

and

Inserting these bounds and dividing by , we conclude

Since , we obtain

Since and , we conclude that

Routine calculus shows that has a maximum of at most , and that the right-hand side here is at most , giving the required contradiction. This proves (20) .

**— 2.2. A simplified estimate —**

Now we show [(21)](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#1le). Note from [(11)](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#alpha-def) that

while from (15) we have and hence also From (15) we have

By the mean value theorem (noting that is non-negative) we thus have

From the standard beta function identity

(and the fact that ) we can thus replace (19) by

From (15) we have

Thus by (37) , (38) , (39)

Dividing by the positive quantity gives the claim.

**— 3. Rubinstein’s theorem —**

We now adapt the arguments to give a proof of Rubinstein’s theorem that the Phelps–Rodriguez conjecture holds in the case, i.e.,

> Theorem 14 (Rubinstein’s theorem) Let , and let be a degree polynomial with all zeroes in the unit disk. If , then there exists a critical point of with , unless is a scalar multiple of .

The argument here is essentially in Remark 5.1 of [this paper of Tang and Zhang](https://arxiv.org/abs/2508.10341).

Taking contrapositives, we may assume that the critical points are of the form for some in the closed unit disk, and normalize to be monic; our task is to show that.

The polar identity [(8)](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#polar-ident), based on calculating degenerates to a triviality when, but we have the following usable substitute, valid for any choice of, first observed in equation (3.2) of [Meir–Sharma](https://zbmath.org/3308557):

> Lemma 15 (Meir–Sharma identity) If and the critical points are of the form then all the zeroes are not equal to , and

*Proof:* By hypothesis, is not a critical point of, so and for all. Instead of computing, we instead consider the expression. On the one hand, from [(4)](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#p-factor) we have

while from differentiating (4) we have

Meanwhile, from (3) we have

and from differentiating (3) we have

Using these identities to compute in two different ways gives the claim.

Now take. Since lie in the closed unit disk, has real part at least, while is at most. Thus, the only way that the above identity can hold is if for all, hence for all. Thus all critical points are at the origin, which forces for some. Since, we conclude that, giving the claim.

**— 4. The cases —**

We now prove the cases of Conjecture [3](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#interior). The starting point is [(23)](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#polar-lower-bound). Using the triangle inequality and, this implies that

(This also follows from (16) and .) From Hölder’s inequality and we conclude that

The right-hand side can be computed to equal

which is obviously less than for , giving the contradiction.

> Remark 16 The same argument also works for , but breaks down for higher .

**— 5. Further directions —**

The Sendov and Phelps–Rodriguez conjectures are now resolved, but several related conjectures remain open. The following strengthening of Sendov’s conjecture, by Borcea, is open for any:

> Conjecture 17 (Borcea conjecture) Let and , and let be a degree polynomial with zeroes satisfying . Then for every zero of , there exists a critical point of with .

Sendov’s conjecture is the limiting case of this conjecture. There has been relatively little progress on this conjecture: the cases were established [by Khavinson, Pereira, Putinar, Saff, and Shimorin](https://zbmath.org/6075447), and in [this previous paper](https://terrytao.wordpress.com/2025/11/05/mathematical-exploration-and-discovery-at-scale/) we reported the negative result that AlphaEvolve failed to find a counterexample to the conjecture. The proof methods here do not seem to extend easily; all the identities relating zeroes and critical points continue to hold, but now that the are only constrained to the unit disk in an averaged moment sense, all of the inequalities developed above now fail.

Another strengthening of Sendov’s conjecture that remains open is [Schmeisser’s conjecture](https://zbmath.org/3539507):

> Conjecture 18 (Schmeisser’s conjecture) Let , and let be a degree polynomial with all zeroes in the closed unit disk. Then for any in the convex hull of the zeroes of , there exists a critical point of with .

Schmeisser proved several special cases of this conjecture, and AlphaEvolve again failed to find a counterexample, but there has not been much further progress. Here, the are now back in the closed unit disk, but we no longer have, again rendering most of the previous identities invalid. But perhaps some modification of the arguments here can make some progress on this conjecture.

A common generalization of the Borcea and Schmeisser conjectures was proposed in Conjecture 2.4 of [this paper of Zhang](https://arxiv.org/abs/2411.07105). A slightly different strengthening was also proposed in Conjecture 1.10 of [Tang and Zhang](https://arxiv.org/abs/2508.10341):

> Conjecture 19 (Tang–Zhang conjecture) Let , and let be a degree polynomial with all zeroes in the closed unit disk and critical points . Then for any , one has .

Sendov’s conjecture is the limiting case. By Hölder’s inequality, the case is the strongest form of the conjecture.

Another well known variant of Sendov’s conjecture is [Smale’s problem](https://zbmath.org/3713836):

> Conjecture 20 (Smale’s problem) Let , and let be a degree polynomial. Then for any zero of , there exists a critical point of with .

The constant is best possible, as can be seen by the example and. Using the Koebe one-quarter theorem, Smale proved this conjecture with replaced by. Some slight improvements of this bound have been obtained over the years; for instance for, the improved bound of was [obtained by Crane](https://zbmath.org/5214827). Again, AlphaEvolve failed to find a counterexample to this conjecture. This problem does not seem to have a direct relationship with Sendov’s conjecture, and there is no useful normalization of the zeroes and critical points that is confined to the unit disk. Nevertheless there may be some hope of making progress on this conjecture, perhaps working first in the asymptotic regime.

Needless to say, I did try some desultory attempts to use AI tools to attack these questions, but without much notable success.

One potential way forward is to find further proofs of Sendov’s conjecture that utilize other techniques that might be more broadly applicable to this larger family of problems. The proof here is remarkable in that the zeroes and critical points are treated almost as independent mathematical objects, communicating with each other only very narrowly through four identities in which one only inspects the underlying polynomial (and its derivative) at a small number of points. It could be that an approach focusing on more global features of the polynomial may lead to new proofs of Sendov’s conjecture, and perhaps also of its generalizations.

### Share this:

- Print (Opens in new window) Print
- Email a link to a friend (Opens in new window) Email
- More
- 

- Share on X (Opens in new window) X
- Share on Facebook (Opens in new window) Facebook
- Share on Reddit (Opens in new window) Reddit
- Share on Pinterest (Opens in new window) Pinterest
- 

Like Loading...

### Recent Comments

|  | [Terence Tao](http://www.math.ucla.edu/~tao) on [Palomar – a registry of…](https://terrytao.wordpress.com/2026/08/18/palomar-a-registry-of-lean-verified-mathematics/comment-page-1/#comment-694007) |
| --- | --- |
|  | [Terence Tao](http://www.math.ucla.edu/~tao) on [Palomar – a registry of…](https://terrytao.wordpress.com/2026/08/18/palomar-a-registry-of-lean-verified-mathematics/comment-page-1/#comment-693985) |
|  | [Terence Tao](http://www.math.ucla.edu/~tao) on [Palomar – a registry of…](https://terrytao.wordpress.com/2026/08/18/palomar-a-registry-of-lean-verified-mathematics/comment-page-1/#comment-693983) |
|  | Anonymous on [Palomar – a registry of…](https://terrytao.wordpress.com/2026/08/18/palomar-a-registry-of-lean-verified-mathematics/comment-page-1/#comment-693981) |
|  | [David Bevan](http://dibevan.wordpress.com) on [Palomar – a registry of…](https://terrytao.wordpress.com/2026/08/18/palomar-a-registry-of-lean-verified-mathematics/comment-page-1/#comment-693980) |
|  | Anonymous on [Palomar – a registry of…](https://terrytao.wordpress.com/2026/08/18/palomar-a-registry-of-lean-verified-mathematics/comment-page-1/#comment-693978) |
|  | Teng Zhang on [A digestion of the proof of Se…](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/comment-page-1/#comment-693976) |
|  | Anonymous on [Palomar – a registry of…](https://terrytao.wordpress.com/2026/08/18/palomar-a-registry-of-lean-verified-mathematics/comment-page-1/#comment-693974) |
|  | Anonymous on [Palomar – a registry of…](https://terrytao.wordpress.com/2026/08/18/palomar-a-registry-of-lean-verified-mathematics/comment-page-1/#comment-693973) |
|  | [Terence Tao](http://www.math.ucla.edu/~tao) on [Notes on the classification of…](https://terrytao.wordpress.com/2013/04/27/notes-on-the-classification-of-complex-lie-algebras/comment-page-1/#comment-693970) |
|  | Anonymous on [A digestion of the Jacobian co…](https://terrytao.wordpress.com/2026/07/21/a-digestion-of-the-jacobian-conjecture-counterexample/comment-page-2/#comment-693968) |
|  | Anonymous on [Notes on the classification of…](https://terrytao.wordpress.com/2013/04/27/notes-on-the-classification-of-complex-lie-algebras/comment-page-1/#comment-693967) |
|  | [Karim Adiprasito](http://adiprasito.wordpress.com) on [A digestion of the proof of Se…](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/comment-page-1/#comment-693965) |
|  | Anonymous on [A digestion of the proof of Se…](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/comment-page-1/#comment-693964) |
|  | Anonymous on [Notes on the classification of…](https://terrytao.wordpress.com/2013/04/27/notes-on-the-classification-of-complex-lie-algebras/comment-page-1/#comment-693963) |

### Top Posts

- Palomar - a registry of Lean verified mathematics
- A digestion of the proof of Sendov's conjecture
- A digestion of the Jacobian conjecture counterexample
- Career advice
- About
- Notes on the classification of complex Lie algebras
- Books
- On writing
- Does one have to be a genius to do maths?
- Work hard

### Categories

- expository (325)
- tricks (13)

additive combinatorics approximate groups arithmetic progressions Artificial Intelligence Ben Green Cauchy-Schwarz Cayley graphs central limit theorem Chowla conjecture compressed sensing correspondence principle cosmic distance ladder distributions divisor function eigenvalues Elias Stein Emmanuel Breuillard entropy equidistribution Erdos ergodic theory Euler equations exponential sums finite fields Fourier transform Freiman's theorem Gowers uniformity norm Gowers uniformity norms graph theory Gromov's theorem GUE Hilbert's fifth problem ICM incompressible Euler equations inverse conjecture Joni Teravainen Kaisa Matomaki Kakeya conjecture Lie algebras Lie groups Liouville function Littlewood-Offord problem Maksym Radziwill Mobius function Navier-Stokes equations nilpotent groups nilsequences nonstandard analysis Paul Erdos politics polymath1 polymath8 Polymath15 polynomial method polynomials prime gaps prime numbers prime number theorem random matrices randomness Ratner's theorem regularity lemma Ricci flow Riemann zeta function Schrodinger equation Shannon entropy sieve theory structure Szemeredi's theorem Tamar Ziegler ultrafilters universality Van Vu wave maps Yitang Zhang

### [The Polymath Blog](https://polymathprojects.org)

- Polymath News and AI
- Polymath projects 2021
- A sort of Polymath on a famous MathOverflow problem
- Ten Years of Polymath
- Updates and Pictures
- Polymath proposal: finding simpler unit distance graphs of chromatic number 5
- A new polymath proposal (related to the Riemann Hypothesis) over Tao’s blog
- Spontaneous Polymath 14 – A success!
- Polymath 13 – a success!
- Non-transitive Dice over Gowers’s Blog

## 44 comments

[Comments feed for this article](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/feed/)

[12 August, 2026 at 4:32 pm](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#comment-693888)

**Anonymous**

What changes to the university mathematics curriculum need to be made in order to produce people who are experts at digesting mathematical proofs?

Reply

[12 August, 2026 at 8:41 pm](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#comment-693890)

**Anonymous**

It may also be interesting to ask whether Sendov’s conjecture sits inside a stronger geometric statement concerning the steepest-ascent trajectories of the polynomial logarithmic potential.

For \[ P(z)=\prod_{j=1}^N(z-a_j), \qquad |a_j|\le 1, \] consider a finite steepest-ascent branch of \(\log|P|\) from a root \(a_j\) to its terminal critical point \(c_{a_j}\). I have been investigating the conjectural bound \[ \operatorname{length}(\gamma_j)\le 1 \] (for \(N\ge 4\); there are counterexamples for \(N=3\)). Since \[ |a_j-c_{a_j}|\le \operatorname{length}(\gamma_j), \] such a bound would imply Sendov while replacing the existential root–critical-point connection by a canonical geometric one.

I have described the conjecture, its inverse-branch formulation, numerical evidence, and a possible variational approach here: [https://math.stackexchange.com/questions/5100337/length-bound-for-a-ray-lift-off-from-a-critical-point-of-a-polynomial](https://math.stackexchange.com/questions/5100337/length-bound-for-a-ray-lift-off-from-a-critical-point-of-a-polynomial)

Reply

[12 August, 2026 at 9:40 pm](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#comment-693891)

**Nick Kuhn**

I think the term “AI *tool*” is redundant at best and misleading at worst (usually tools are targeted for a specific task rather than just being generally good at something).

Just “AIs” seems cleaner and better for the discourse.

Reply

[12 August, 2026 at 11:20 pm](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#comment-693895)

**Lech Mazur**

I should mention that the version of the proof analyzed here is an extreme case of the tradeoff between AI- and human-friendliness. It was deliberately optimized for ease of verification in Lean and avoided external theorems that would have had to be formalized separately. It was also designed to keep the mathematical argument compact and auditable rather than conceptually transparent. Its target is the AI-agent-first ProofAtlas.ai, not a preprint (I’d like to eventually have explanations and notes on that website that are digestible to human mathematicians but that is not my priority at the moment and I figured that anybody interested enough to want to “read” it would be able to use AI to transform it into something that makes sense to them much more effectively than I could with some generalizable workflow.)

Also, most of the Lean code consisted of generated certificate machinery, not individually AI-written proof code. There were about 17k “authored” lines of Lean out of ~93k total lines.

Reply

[13 August, 2026 at 6:03 am](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#comment-693897)

**Teng**

About a month ago, I made your “sufficiently large” n_0 explicit, showing that one can take n_0 = 10^200000; see [https://zhangteng2000.github.io/files/sendov_conjecture_large_n.pdf](https://zhangteng2000.github.io/files/sendov_conjecture_large_n.pdf). Perhaps this bound could be reduced further with the help of AI, but I did not try. In any case, I am very glad to see that Sendov’s conjecture has finally been resolved. In the past, I spent many years trying to approach the problem using methods based on the spectral radius of matrices, but without success.

Reply

[13 August, 2026 at 7:59 am](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#comment-693902)

**Anonymous**

It would extremely helpful if you could share the exact details and process that you followed to generate the Lean proof.

In the code repository it says: [https://github.com/teorth/sendov#how-this-was-produced](https://github.com/teorth/sendov#how-this-was-produced) “”” Essentially all of the Lean source in this repository was written by Claude Opus 5 (Anthropic), working interactively in Claude Code under the direction and review of the author: choosing the Lean formulations, finding and repairing proofs, and designing the certificate machinery. The author set the targets, supplied the informal proof and the staged plans in docs/, made the mathematical decisions, and reviewed the output as it was produced. “”” but it is very hard to tell how this is really done hands-down.

Sharing all the details of the process would be a great example for other Mathematicians how this is done so that we can follow suit.

Reply

[13 August, 2026 at 1:13 pm](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#comment-693907)

**[Anton Shakov](http://principia-math.com)**

Hi Dr. Tao,

Having thought about Sendov’s conjecture for a number of years, I wanted to ask you a few questions.

1. Which part(s) of the proof do you think represent the key insight that human researchers hadn’t previously found?
2. Are you more impressed that the LLM was able to find this proof, or surprised that humans had not been able to until now?
3. Do you think it would be possible to describe the approach to a knowledgeable mathematician who could then fill in the details, or is the proof too reliant on hyperspecific silver-bullet identities? (perhaps the Polar and Origin inequalities).

Reply

[13 August, 2026 at 7:34 pm](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#comment-693914)

**Anonymous**

Your comment about the low-tech nature of the proof makes me wonder about the hypothetical universe in which current AI models were developed before the proof of the prime number theorem. Might AI have come up with the elementary proof of the prime number theorem before the complex-analytic proof? If it had, perhaps it would have had the ironic side effect of delaying progress in analytic number theory.

Reply

[14 August, 2026 at 9:02 am](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#comment-693928)

**Anonymous**

Long story short: polynomial degeneracy always pushes, not pulls; as in $(x-1) \cdot (x+1)^(n-1)$ for $n>2$

Reply

[14 August, 2026 at 10:08 am](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#comment-693929)

**Anonymous**

The original Bourbaki members would probably love this new era of mathematics. I think it just proves that math is not as interesting as we previously thought, because the current AI powered machines solving the problems are not intelligent yet, by no means (and they would never have the best ideas that humans have produced, since the Ancient Greeks to the times of Einstein and others). After all, math took the same fate as chess (which makes sense, because chess is a part of math). Still, people can still become physicists! ChatGPT etc can’t solve simple questions about gravity, electromagnetism, astronomy, for now, unless some human already solved it and it knows the answer already! Math will remain interesting as a hobby/pastime/leisure, for those who like to think, but young people will probably see the Riemann hypothesis solved by some AI someday, and what’s the point of competing against such AI? The human brain is very limited, and math is hard for us, but it’s just natural for the AI! :) People are sad because they like math as it’s done nowadays, but everything comes to an end someday! In the past, Jacob Steiner used to complain about coordinate geometry because it reduced the solution of geometric problems to calculations, in contrast to synthetic geometry (where one had to think)… The think is, as math evolves, one needs less and less thinking to solve the problems, that’s one of the points of math! (but it’s not satisfying to our brain!) So: The proofs of important conjectures will soon become not understandable by humans, but we will not have to think to get them, and we should be humble about that. After all: we are just humans, very limited animals! Machines can handle math better than us after all (and someday, probably everything else)…

Reply

[14 August, 2026 at 4:05 pm](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#comment-693938)

**Anonymous**

The abstract of the linked paper is a good example of oddly terrible AI writing.

The second sentence

“One invertible scaling and rotation turns a hypothetical failure into a normalized obstruction while preserving all root and critical-point multiplicities”

as far as I can tell, is just referring to the fact you can normalize to assume $a$ is real? But what an overwrought way to state something a human author wouldn’t bother mentioning…

Reply

[14 August, 2026 at 9:40 pm](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#comment-693939)

**Anonymous**

Why is Phelps–Rodriguez a strengthening? If I understood text and lean definition correctly, it is simply “Sendov’s conjecture is true if we disregard this subset of cases” – so… shouldn’t it be weaker?

Reply

[14 August, 2026 at 9:48 pm](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#comment-693940)

**Anonymous**

I’m unfamiliar with minute details of Lean, but in the last part of Sendov.phelps_rodriguez problem statement {p = C c * (X ^ n – C (a ^ n))} where did C appear from? I can see c gets defined right before, but what is C? is it some mathlib-defined way of multiplication constant?

Reply

[15 August, 2026 at 3:12 pm](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#comment-693947)

**dutifullyb3c31ab42c**

How is the value of this work (from the aspect of effects on mathematics and the ability of AI respectively) compared with the recent works on Erdős unit distance problem and non-Sofic groups?

Reply

[16 August, 2026 at 1:34 pm](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#comment-693959)

**Anonymous**

I looked at the Mazur paper, and the project he/his company runs (proofatlas.ai). The site seems really set up as a collaborative project than just resulting from his personal insights and prompts. The preprint is also not mentioning the prompts, contributors etc. Of course, part of it is hidden also behind the fact that the reasoning is something given by LLM in the end, which may not understand it’s sources. But with what justification is this credited as “Lech Mazur with help of LLM” rather than “LLM+?”

Reply

[17 August, 2026 at 5:22 pm](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#comment-693964)

**Anonymous**

Hi Terrence. Thank you for the breakdown. While at the University of Newcastle, I once (in passing) was acquainted with an approach to Sendov’s conjecture involving the log derivative. An academic there was certain it could be proved in an elegant manner this way.

I simply asked ChatGPT to rewrite the proof on this page in terms of the log derivative:

[https://chatgpt.com/s/t_6a83b1b602188191a8b0a49bb2652b03](https://chatgpt.com/s/t_6a83b1b602188191a8b0a49bb2652b03)

I am unsure if this is useful, but it certainly helped me to understand what was going on

Reply

### Leave a comment [Cancel reply](https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/#respond)

### For commenters

To enter in LaTeX in comments, use $latex *<Your LaTeX code>* $ (without the < and > signs, of course; in fact, these signs should be avoided as they can cause formatting errors). Also, backslashes \ need to be doubled as \\. See the [about page](https://terrytao.wordpress.com/about/) for details and for other commenting policy.

« A partial digestion of the HRT counterexample

Palomar – a registry of Lean verified mathematics »

[Blog at WordPress.com.](https://wordpress.com/?ref=footer_blog) Ben Eastaugh and Chris Sternal-Johnson.

[Subscribe to feed.](https://terrytao.wordpress.com/feed/)

- Comment
- Reblog
- Subscribe Subscribed
- What's new
- 
    Already have a WordPress.com account? Log in now.

%d