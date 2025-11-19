import { useState, useMemo } from 'react';

interface Agent {
  id: string;
  name: string;
  description: string;
  tags: string[];
  platform: string;
}

export const useAgentSearch = (agents: Agent[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('');

  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      const matchesSearch =
        searchQuery === '' ||
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesPlatform =
        platformFilter === '' || agent.platform === platformFilter;

      return matchesSearch && matchesPlatform;
    });
  }, [agents, searchQuery, platformFilter]);

  return {
    filteredAgents,
    searchQuery,
    platformFilter,
    setSearchQuery,
    setPlatformFilter,
  };
};
