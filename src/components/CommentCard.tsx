import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { HeartIcon } from 'lucide-react';

interface CommentCardProps {
    content: string;
    createdAt: Date | string;
    likes: number;
}

const CommentCard: React.FC<CommentCardProps> = ({
    content,
    createdAt,
    likes
}) => {
    const date = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
    const timeAgo = formatDistanceToNow(date, { addSuffix: true });

    return (
        <div className="p-4 rounded-lg border border-border-subtle bg-background-secondary">
            <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-sm">👤</span>
                </div>
                <span className="text-xs text-text-muted">Anonymous</span>
                <span className="text-xs text-text-muted ml-auto">{timeAgo}</span>
            </div>

            <p className="text-text-primary mb-3 font-body">{content}</p>

            <div className="flex items-center">
                <button className="flex items-center gap-1 text-text-muted hover:text-primary transition-colors">
                    <HeartIcon size={14} />
                    <span className="text-xs">{likes}</span>
                </button>
            </div>
        </div>
    );
};

export default CommentCard;
