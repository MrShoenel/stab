/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../app.common.ts" />

module Blog.ArticleList {
	/**
	 * The default list-strategy that chronologically orders all articles,
	 * newest to oldest.
	 */
	export class ListAllStrategy extends Common.AListStrategy {
		type = 'all';
		reverse = false;
		itemsList = (source: Common.MetaArticle[]) => {
			var x = this.reverse ? -1 : 1, y = this.reverse ? 1 : -1;
			return source.sort((a, b) => Date.parse(a.lastMod) < Date.parse(b.lastMod) ? x : y);	
		};
		
		/**
		 * Override to signal that this strategy can handle the 'all' list-type.
		 */
		static canHandle = (listType: string) => {
			return (listType + '').toLowerCase() === 'all';
		}
	}
	
	
	/**
	 * Another example strategy that lists all meta articles which have
	 * their last modification in the matched year.
	 */
	export class ByYearStrategy extends Common.AListStrategy {
		/**
		 * Returns all articles within the given year (the year was supplied
		 * here in the constructor as the listType-argument).
		 */
		itemsList = (source: Common.MetaArticle[]) => {
			var minTime = Date.parse(this.type),
				maxTimeExcl = Date.parse((parseInt(this.type) + 1).toString());
			var x = this.reverse ? -1 : 1, y = this.reverse ? 1 : -1;
			
			return source.filter(metaArt => {
				var lm = Date.parse(metaArt.lastMod);
				return lm >= minTime && lm < maxTimeExcl;
			}).sort((a, b) => Date.parse(a.lastMod) < Date.parse(b.lastMod) ? x : y);
		};
				
		static canHandle = (listType: string) => {
			return /^2[0-9]{3}$/.test(listType) && !isNaN(Date.parse(listType));
		};
	}
	
	
	/**
	 * A simple search strategy that takes a term and scores them against
	 * all articles' properties and selects the highest score per article.
	 * It returns then a descending list of them.
	 */
	export class SimpleSearchStrategy extends Common.AListStrategy {
		itemsList = (source: Common.MetaArticle[]) => {
			var searchParam = (<string>this.injected['locationSearch']).toLowerCase();
			
			if (searchParam === undefined) {
				return source.slice(0);
			}
			
			return source.map(metaArt => {
				metaArt.score = Math.max.apply(null, Object.keys(metaArt).map(key => {
					return angular.isString(metaArt[key]) ?
						SimpleSearchStrategy.score((<string>metaArt[key]).toLowerCase(), searchParam) : 0;
				}));
				return metaArt;
			}).filter(metaArt => metaArt.score > 0).sort((o1, o2) => {
				return o2.score - o1.score;
			});
		};
		
		static canHandle = (listType: string) => {
			return (listType + '').toLowerCase() === 'search'
		};
		
		/**
		 * Taken from https://github.com/joshaven/string_score/blob/master/string_score.js
		 * and modified to be a static function instead.
		 */
		private static score = (str: string, word: string, fuzziness?: number): number => {
			// If the string is equal to the word, perfect match.
			if (str === word) { return 1; }
		
			//if it's not a perfect match and is empty return 0
			if (word === "") { return 0; }
		
			var runningScore = 0,
					charScore,
					finalScore,
					lString = str.toLowerCase(),
					strLength = str.length,
					lWord = word.toLowerCase(),
					wordLength = word.length,
					idxOf,
					startAt = 0,
					fuzzies = 1,
					fuzzyFactor,
					i;
		
			// Cache fuzzyFactor for speed increase
			if (fuzziness) { fuzzyFactor = 1 - fuzziness; }
		
			// Walk through word and add up scores.
			// Code duplication occurs to prevent checking fuzziness inside for loop
			if (fuzziness) {
				for (i = 0; i < wordLength; i+=1) {
		
					// Find next first case-insensitive match of a character.
					idxOf = lString.indexOf(lWord[i], startAt);
		
					if (idxOf === -1) {
						fuzzies += fuzzyFactor;
					} else {
						if (startAt === idxOf) {
							// Consecutive letter & start-of-string Bonus
							charScore = 0.7;
						} else {
							charScore = 0.1;
		
							// Acronym Bonus
							// Weighing Logic: Typing the first character of an acronym is as if you
							// preceded it with two perfect character matches.
							if (str[idxOf - 1] === ' ') { charScore += 0.8; }
						}
		
						// Same case bonus.
						if (str[idxOf] === word[i]) { charScore += 0.1; }
		
						// Update scores and startAt position for next round of indexOf
						runningScore += charScore;
						startAt = idxOf + 1;
					}
				}
			} else {
				for (i = 0; i < wordLength; i+=1) {
					idxOf = lString.indexOf(lWord[i], startAt);
					if (-1 === idxOf) { return 0; }
		
					if (startAt === idxOf) {
						charScore = 0.7;
					} else {
						charScore = 0.1;
						if (str[idxOf - 1] === ' ') { charScore += 0.8; }
					}
					if (str[idxOf] === word[i]) { charScore += 0.1; }
					runningScore += charScore;
					startAt = idxOf + 1;
				}
			}
		
			// Reduce penalty for longer strings.
			finalScore = 0.5 * (runningScore / strLength + runningScore / wordLength) / fuzzies;
		
			if ((lWord[0] === lString[0]) && (finalScore < 0.85)) {
				finalScore += 0.15;
			}
		
			return finalScore;
		};
	}
}