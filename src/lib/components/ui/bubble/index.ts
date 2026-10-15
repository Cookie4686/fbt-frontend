import Content from "./bubble-content.svelte";
import Group from "./bubble-group.svelte";
import Reactions, {
	type BubbleReactionsAlign,
	type BubbleReactionsSide,
	bubbleReactionsVariants,
} from "./bubble-reactions.svelte";
import Root, { type BubbleVariant, bubbleVariants } from "./bubble.svelte";

export {
	Root,
	Group,
	Content,
	Reactions,
	bubbleVariants,
	bubbleReactionsVariants,
	type BubbleVariant,
	type BubbleReactionsSide,
	type BubbleReactionsAlign,
	//
	Root as Bubble,
	Group as BubbleGroup,
	Content as BubbleContent,
	Reactions as BubbleReactions,
};
