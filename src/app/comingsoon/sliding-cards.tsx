'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, Send, Mic, WaveformIcon, Users, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useState as useState2, useEffect as useEffect2 } from 'react' 
import { Button as Button2, } from "@/components/ui/button" 
import { ChevronLeftIcon as ChevronLeft2, ChevronRightIcon as ChevronRight2 } from 'lucide-react' 


<style jsx>{`
  .text-shadow {
    text-shadow: 0 1px 2px rgba(0,0,0,0.1), 0 0 15px rgba(255,255,255,0.5);
  }
`}</style>

interface Comment {
  id: number
  text: string
  author: {
    name: string
    image: string
  }
}

interface Card {
  id: number
  title: string
  description: string
  comments: Comment[]
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  reaction: 'like' | 'dislike' | null
  likes: number
  dislikes: number
  deleteComment: (commentId: number) => void;
}

const originalCards: Card[] = [
  { 
    id: 1, 
    title: "Smart Contract Audit Automation", 
    description: "Build an AI-powered platform that automatically scans and audits smart contracts for vulnerabilities and optimization opportunities. The system would provide detailed reports, risk assessments, and suggestions for improvements, helping blockchain developers save time and reduce security risks.", 
    comments: [],
    difficulty: 'MEDIUM',
    reaction: null,
    likes: 0,
    dislikes: 0,
    deleteComment: () => {}
  },
  { id: 2, title: "Decentralized Identity Verification", description: "Create a blockchain-based identity verification system that allows users to securely store and share their personal information without relying on centralized authorities. This system would enhance privacy, reduce identity theft, and streamline KYC processes across various industries.", comments: [], difficulty: 'HARD', reaction: null, likes: 0, dislikes: 0, deleteComment: () => {} },
  { id: 3, title: "Cross-Chain DeFi Aggregator", description: "Develop a DeFi platform that aggregates liquidity and trading opportunities across multiple blockchain networks, allowing users to easily swap tokens and participate in yield farming with the best rates and lowest fees, regardless of the underlying blockchain.", comments: [], difficulty: 'MEDIUM', reaction: null, likes: 0, dislikes: 0, deleteComment: () => {} },
]

const userProfileImage = "https://ms-application-assets.s3.amazonaws.com/member-profile-images/1732002389135459757939_1039317191225455_6987087493553251432_n.jpg"
const userName = "Martin Svarc"

const inProgressComponentsData = [
  { 
    id: 1, 
    name: "AI Call Coach: Your Real-Time Conversation Expert", 
    description: "Turn every call into a masterpiece with AI assistance that listens, learns, and guides in real-time. Like having an expert mentor quietly offering suggestions during your customer conversations - but powered by artificial intelligence.",
    icon: Mic,
    backgroundImage: "https://res.cloudinary.com/drkudvyog/image/upload/v1734285873/fialova_3_s6lpyw.png",
    comments: []
  },
  { 
    id: 2,
    name: "Voice Mood Mirror: Real-Time Emotion Intelligence Coach",
    description: "Transform your communication by understanding the hidden melody of your voice. Our AI analyzes your tone, tempo, and emotional patterns as you speak, providing instant feedback to help you connect better with others. Like having a personal communication coach who whispers insights about your voice's emotional impact right when you need them.",
    icon: WaveformIcon,
    backgroundImage: "https://res.cloudinary.com/drkudvyog/image/upload/v1734285872/fialova_2_lmaocp.png",
    comments: []
  },
  {
    id: 3,
    name: "Journey Sessions: Multi-Call Avatar Success Path",
    description: "Transform single interactions into meaningful relationship-building journeys. Our AI-powered avatars remember previous conversations and evolve the dialogue across multiple sessions, simulating authentic long-term customer relationships. Each call builds upon the last, creating a natural progression toward successful outcomes - just like real-world sales and support cycles.",
    icon: Users,
    backgroundImage: "https://res.cloudinary.com/drkudvyog/image/upload/v1734285871/fialova_1_w5mps1.png",
    comments: []
  },
];

export default function RequestAndUpgrades() {
  const [cards, setCards] = useState<Card[]>([])
  const [userTitle, setUserTitle] = useState("")
  const [userInput, setUserInput] = useState("")
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [newComments, setNewComments] = useState<{ [key: number]: string }>({})
  const [isExpanded, setIsExpanded] = useState(false)
  const [animatingCommentId, setAnimatingCommentId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<{ cardId: number, commentId: number } | null>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<number>>(new Set());
  const [currentInProgressIndex, setCurrentInProgressIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 3;
  const titleInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const [inProgressComponents, setInProgressComponents] = useState(inProgressComponentsData);
  const [currentCardPage, setCurrentCardPage] = useState(1);
  const cardsPerPage2 = 3;


  useEffect(() => {
    setCards([...originalCards])
  }, [])

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus()
    }
  }, [isEditingTitle])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentInProgressIndex((prevIndex) => (prevIndex + 1) % inProgressComponents.length);
    }, 8000); 

    return () => clearInterval(interval);
  }, [inProgressComponents.length]);

  useEffect(() => {
    setCurrentPage(1);
  }, [cards]);

  const handleExpandClick = () => {
    setIsExpanded(true)
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 300) 
  }

  const handleCollapseClick = () => {
    setIsExpanded(false)
  }

  const handleSubmit = () => {
    if (userTitle.trim() !== "" && userInput.trim() !== "") {
      const newCard: Card = {
        id: Date.now(),
        title: userTitle,
        description: userInput,
        comments: [],
        difficulty: 'MEDIUM',
        reaction: null,
        likes: 0,
        dislikes: 0,
        deleteComment: (commentId: number) => handleDeleteComment(newCard.id, commentId)
      }
      setCards(prevCards => [newCard, ...prevCards])
      setUserTitle("")
      setUserInput("")
      setIsExpanded(false)
      setCurrentCardPage(1) 
    }
  }

  const handleTitleClick = () => {
    setIsEditingTitle(true)
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserTitle(e.target.value)
  }

  const handleTitleBlur = () => {
    setIsEditingTitle(false)
  }

  const handleCommentChange = (cardId: number, value: string) => {
    setNewComments({ ...newComments, [cardId]: value })
  }

  const handleCommentSubmit = (componentId: number) => {
    const commentText = newComments[componentId]
    if (commentText && commentText.trim() !== "") {
      const newComment = {
        id: Date.now(),
        text: commentText,
        author: {
          name: userName,
          image: userProfileImage
        }
      };

      setCards(prevCards => 
        prevCards.map(card => 
          card.id === componentId 
            ? {
                ...card,
                comments: [newComment, ...card.comments],
                deleteComment: (commentId: number) => handleDeleteComment(componentId, commentId)
              }
            : card
        )
      );

      setInProgressComponents(prevComponents => 
        prevComponents.map(component => 
          component.id === componentId 
            ? { ...component, comments: [newComment, ...(component.comments || [])] }
            : component
        )
      );

      setNewComments({ ...newComments, [componentId]: "" })
      setAnimatingCommentId(componentId)
      setTimeout(() => setAnimatingCommentId(null), 500)
    }
  }

  const handleReaction = (componentId: number, newReaction: 'like' | 'dislike') => {
    setCards(prevCards =>
      prevCards.map(card => ({
        ...card,
        ...originalCards.map(component => {
          if (component.id === componentId) {
            const oldReaction = component.reaction;
            const newLikes = newReaction === 'like' ? (oldReaction === 'like' ? component.likes - 1 : component.likes + 1) : (oldReaction === 'like' ? component.likes - 1 : component.likes);
            const newDislikes = newReaction === 'dislike' ? (oldReaction === 'dislike' ? component.dislikes - 1 : component.dislikes + 1) : (oldReaction === 'dislike' ? component.dislikes - 1 : component.dislikes);
            
            return {
              ...component,
              reaction: oldReaction === newReaction ? null : newReaction,
              likes: newLikes,
              dislikes: newDislikes
            };
          }
          return component;
        })
      }))
    );
  };

  const handleDeleteComment = (cardId: number, commentId: number) => {
    setCards(prevCards =>
      prevCards.map(card =>
        card.id === cardId
          ? { ...card, comments: card.comments.filter(comment => comment.id !== commentId) }
          : card
      )
    );
    setInProgressComponents(prevComponents =>
      prevComponents.map(component =>
        component.id === cardId
          ? { ...component, comments: component.comments.filter(comment => comment.id !== commentId) }
          : component
      )
    );
  };

  const toggleDescription = (componentId: number) => {
    setExpandedDescriptions(prev => {
      const next = new Set(prev);
      if (next.has(componentId)) {
        next.delete(componentId);
      } else {
        next.add(componentId);
      }
      return next;
    });
  };

  const renderInProgressComponents = () => (
    <div className="mb-8">
      <div className="h-[360px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={inProgressComponents[currentInProgressIndex].id}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden h-full"
          >
            <div 
              className="w-full h-full relative"
              style={{
                backgroundImage: inProgressComponents[currentInProgressIndex].backgroundImage 
                  ? `url(${inProgressComponents[currentInProgressIndex].backgroundImage})`
                  : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              <div className="absolute inset-0 bg-white/20"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-white/60 to-transparent"></div>
              <div className="relative z-20 h-full p-6 text-shadow">
                <div className="flex items-center mb-4">
                  <h3 className="text-4xl font-bold text-[#5b06be]">{inProgressComponents[currentInProgressIndex].name}</h3>
                </div>
                <p className="text-gray-900 text-lg mb-4 leading-relaxed">{inProgressComponents[currentInProgressIndex].description}</p>
                <p className="text-xl font-semibold text-[#5b06be]">Coming soon...</p>
              </div>
              <motion.div
                className="absolute inset-0 bg-white opacity-10"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.1, 0.2, 0.1],
                  x: [0, 50, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )

  const renderCollapsedForm = () => (
    <motion.div 
      className="bg-white rounded-2xl shadow-lg overflow-hidden mb-4 cursor-pointer"
      onClick={handleExpandClick}
      initial={{ height: 'auto' }}
      animate={{ height: 'auto' }}
      exit={{ height: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Request your own upgrade...
          </h2>
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </motion.div>
  )

  const renderExpandedForm = () => (
    <motion.div 
      ref={formRef} 
      className="bg-white rounded-2xl shadow-lg overflow-hidden mb-4"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">
              Request your own upgrade...
            </h2>
          </div>
          <motion.button
            onClick={handleCollapseClick}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Collapse form"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronUp className="w-5 h-5 text-gray-400" />
          </motion.button>
        </div>
        {isEditingTitle ? (
          <Input
            ref={titleInputRef}
            value={userTitle}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            className="text-xl font-bold mb-4 text-gray-900"
          />
        ) : (
          <div className="space-y-4">
            <Input
              placeholder="Enter your upgrade headline..."
              value={userTitle}
              onChange={(e) => setUserTitle(e.target.value)}
              className="text-xl font-bold text-gray-900 border-none bg-gray-50 p-4 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 ease-in-out"
            />
            <Textarea
              placeholder="Describe your upgrade idea..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="w-full min-h-[150px] resize-none rounded-xl border-none bg-gray-50 p-4 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 ease-in-out"
            />
            <motion.button 
              onClick={handleSubmit} 
              className="w-full bg-[#f8b922] hover:bg-[#f8b922]/90 text-white rounded-xl py-3 text-lg font-semibold transition-all duration-300 ease-in-out"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Send
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  )

  const renderCard = (card: Card) => (
    <div 
      className="bg-white rounded-2xl shadow-lg overflow-hidden flex-shrink-0 h-full"
    >
      <div className="p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
              <Image
                src={userProfileImage}
                alt={userName}
                width={32}
                height={32}
                className="object-cover"
              />
            </div>
            <span className="font-semibold text-gray-900">{userName}</span>
          </div>
          <div className="flex space-x-2">
            <motion.button 
              className={`px-3 py-1 ${
                card.reaction === 'like' ? 'bg-green-500' : 'bg-[#f8b922]'
              } hover:bg-opacity-90 text-white rounded-full flex items-center justify-center`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleReaction(card.id, 'like')}
            >
              <ThumbsUp className={`w-4 h-4 ${card.reaction === 'like' ? 'fill-white' : ''}`} />
              <span className="ml-1">{card.likes}</span>
            </motion.button>
            <motion.button 
              className={`px-3 py-1 ${
                card.reaction === 'dislike' ? 'bg-red-500' : 'bg-[#f8b922]'
              } hover:bg-opacity-90 text-white rounded-full flex items-center justify-center`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleReaction(card.id, 'dislike')}
            >
              <ThumbsDown className={`w-4 h-4 ${card.reaction === 'dislike' ? 'fill-white' : ''}`} />
              <span className="ml-1">{card.dislikes}</span>
            </motion.button>
          </div>
        </div>

        <div className="mb-4 min-h-[200px]">
          <h2 className="text-xl font-bold text-gray-900 mb-2">{card.title}</h2>
          <div className="text-gray-600">
            <p className={expandedDescriptions.has(card.id) ? "" : "line-clamp-4"}>
              {card.description}
            </p>
            {card.description.length > 280 && (
              <button
                onClick={() => toggleDescription(card.id)}
                className="text-[#f8b922] hover:text-[#f8b922]/80 text-sm font-medium mt-1"
              >
                {expandedDescriptions.has(card.id) ? "Show less" : "Show more"}
              </button>
            )}
          </div>
        </div>

        <div className="mt-auto space-y-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Add a comment..."
              value={newComments[card.id] || ""}
              onChange={(e) => handleCommentChange(card.id, e.target.value)}
              className="flex-grow border border-[#f8b922]/20 focus:border-[#f8b922]/40 focus:ring-0 rounded-full shadow-sm transition-all duration-300"
            />
            <motion.button 
              onClick={() => handleCommentSubmit(card.id)} 
              className="bg-[#f8b922] hover:bg-[#f8b922]/90 text-white rounded-full w-10 h-10 flex items-center justify-center p-0 min-w-[2.5rem]"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Comments:</h3>
          <div className="space-y-4">
            <ScrollArea className="h-[300px] w-full pr-4">
              {card.comments.map((comment) => (
                <div key={comment.id} className="relative group hover:bg-gray-50 p-3 -mx-3 rounded-lg transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={comment.author.image}
                        alt={comment.author.name}
                        width={32}
                        height={32}
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[15px] text-gray-900 mb-0.5">{comment.author.name}</p>
                      <p className="text-[15px] text-gray-700 leading-normal break-words">{comment.text}</p>
                    </div>
                    <motion.button
                      onClick={() => {setCommentToDelete({cardId: card.id, commentId: comment.id}); setDeleteDialogOpen(true)}}
                      className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all self-start -mt-1 -mr-1"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  )

  const indexOfLastCard = currentCardPage * cardsPerPage2;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage2;
  const currentCards = cards.slice(indexOfFirstCard, indexOfLastCard);

  const paginate = (pageNumber: number) => setCurrentCardPage(pageNumber);

  const renderPagination = () => {
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(cards.length / cardsPerPage2); i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex justify-center items-center space-x-2 mt-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => paginate(currentCardPage - 1)}
          disabled={currentCardPage === 1}
          className="rounded-full w-8 h-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {pageNumbers.map((number) => (
          <Button
            key={number}
            onClick={() => paginate(number)}
            variant={currentCardPage === number ? "default" : "outline"}
            className={`rounded-full w-8 h-8 ${
              currentCardPage === number ? "bg-gray-900 text-white" : ""
            }`}
          >
            {number}
          </Button>
        ))}
        <Button
          variant="outline"
          size="icon"
          onClick={() => paginate(currentCardPage + 1)}
          disabled={currentCardPage === Math.ceil(cards.length / cardsPerPage2)}
          className="rounded-full w-8 h-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="w-full bg-gray-50/50 p-4">
      <div className="max-w-6xl mx-auto">
        {renderInProgressComponents()}
        <AnimatePresence mode="wait">
          {isExpanded ? renderExpandedForm() : renderCollapsedForm()}
        </AnimatePresence>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {currentCards.map((card) => (
            <div key={card.id}>
              {renderCard(card)}
            </div>
          ))}
        </div>
        {cards.length > cardsPerPage2 && renderPagination()}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Comment</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this comment? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (commentToDelete) {
                    handleDeleteComment(commentToDelete.cardId, commentToDelete.commentId);
                    setDeleteDialogOpen(false);
                  }
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

